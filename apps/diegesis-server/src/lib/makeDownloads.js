const {Proskomma} = require('proskomma-core');
const {PerfRenderFromProskomma, render, mergeActions} = require('proskomma-json-tools');
const {ptBooks} = require('proskomma-utils');
const path = require("path");
const fse = require('fs-extra');
const {parentPort} = require("node:worker_threads");
const {
    transPath,
    usfmDir,
    usxDir,
    perfDir,
    simplePerfDir,
    sofriaDir,
    succinctPath,
    lockPath,
    translationDir,
} = require("./dataLayers/fs/dataPaths.js");
const {
    lockEntry,
    unlockEntry,
    readEntryMetadata,
    entryHas,
    readEntryResource,
    writeEntryResource,
    writeSuccinctError,
} = require('./dataLayers/fs');
const documentStatsActions = require("./documentStatsActions");

function doDownloads({configString, org, transId, revision, contentType}) {
    const config = JSON.parse(configString);
    try {
        const orgDir = translationDir(org);
        const dataPath = config.dataPath;
        const t = Date.now();
        lockEntry(config, org, transId, revision, "makeDownloads");
        const metadata = readEntryMetadata(config, org, transId, revision);
        let contentDir = null;
        if (contentType === "usfm") {
            contentDir = usfmDir(dataPath, orgDir, transId, revision)
        } else if (contentType === "usx") {
            contentDir = usxDir(dataPath, orgDir, transId, revision);
        }
        let vrsContent = null;
        if (entryHas(config, org, transId, revision, "versification.vrs")) {
            vrsContent = readEntryResource(config, org, transId, revision, "versification.vrs");
        }
        const downloads = makeDownloads(
            config,
            org,
            metadata,
            contentType,
            contentDir ? fse.readdirSync(contentDir).map(f => fse.readFileSync(path.join(contentDir, f)).toString()) : null,
            vrsContent,
        );
        if (downloads.succinctError) {
            writeSuccinctError(config, org, transId, revision, downloads.succinctError);
            unlockEntry(config, org, transId, revision);
            return;
        }
        if (downloads.succinct) {
            writeEntryResource(config, org, transId, revision, "generated", "succinct.json", downloads.succinct);
        }
        unlockEntry(config, org, transId, revision);
        parentPort.postMessage({org, transId, revision, status: "done"});
    } catch (err) {
        const succinctError = {
            generatedBy: 'cron',
            context: {
                taskSpec,
            },
            message: err.message
        };
        parentPort.postMessage(succinctError);
        writeSuccinctError(config, org, transId, revision, succinctError);
        unlockEntry(config, org, transId, revision);
    }
}

function makeDownloads(config, org, metadata, docType, docs, vrsContent) {
    parentPort.postMessage({where: "here"});
    const dataPath = config.dataPath;
    const orgDir = translationDir(org);
    let pk;
    let docSetId;
    let ret;
    try {
        pk = new Proskomma([
            {
                name: "source",
                type: "string",
                regex: "^[^\\s]+$"
            },
            {
                name: "project",
                type: "string",
                regex: "^[^\\s]+$"
            },
            {
                name: "revision",
                type: "string",
                regex: "^[^\\s]+$"
            },
        ]);
        ret = {
            succinct: null,
            perf: [],
            simplePerf: [],
            sofria: [],
            stats: {
                nOT: 0,
                nNT: 0,
                nDC: 0,
                nChapters: 0,
                nVerses: 0,
                nIntroductions: 0,
                nHeadings: 0,
                nFootnotes: 0,
                nXrefs: 0,
                nStrong: 0,
                nLemma: 0,
                nGloss: 0,
                nContent: 0,
                nMorph: 0,
                nOccurrences: 0,
                documents: {}
            }
        };
        if (entryHas(config, org, metadata.id, metadata.revision, "succinct.json")) {
            const succinct = readEntryResource(config, org, metadata.id, metadata.revision, "succinct.json");
            pk.loadSuccinctDocSet(succinct);
        } else {
            pk.importDocuments(
                {
                    source: org,
                    project: metadata.id,
                    revision: metadata.revision,
                },
                docType,
                docs,
            );
        }
        const docSet = pk.gqlQuerySync('{docSets { id documents { bookCode: header(id: "bookCode") sequences {type} } } }').data.docSets[0];
        docSetId = docSet.id;
        const docSetBookCodes = docSet.documents.map(d => d.bookCode);
        for (const bookCode of docSetBookCodes) {
            for (const section of ['ot', 'nt', 'dc']) {
                if (ptBooks[bookCode].categories.includes(section)) {
                    ret.stats[`n${section.toUpperCase()}`]++;
                }
            }
        }
        const sequenceTypes = new Set([]);
        for (const sequences of docSet.documents.map(d => d.sequences)) {
            for (const sequenceType of sequences.map(s => s.type)) {
                sequenceTypes.add(sequenceType);
            }
        }

        let metadataTags = `"title:${metadata.title}" "copyright:${metadata.copyright}" "language:${metadata.languageCode}" """owner:${metadata.owner}"""`;
        metadataTags += ` "nOT:${ret.stats.nOT}" "nNT:${ret.stats.nNT}" "nDC:${ret.stats.nDC}"`;
        if (metadata.textDirection) {
            metadataTags += ` "direction:${metadata.textDirection}"`;
        }
        if (metadata.script) {
            metadataTags += ` "script:${metadata.script}"`;
        }
        pk.gqlQuerySync(`mutation { addDocSetTags(docSetId: "${docSetId}", tags: [${metadataTags}]) }`);
        if (vrsContent) {
            pk.gqlQuerySync(`mutation { setVerseMapping(docSetId: "${docSetId}" vrsSource: """${vrsContent}""")}`);
        }
    } catch (err) {
        ret.succinctError = {
            generatedBy: 'cron',
            context: {
                docSetId: docSetId || "???",
                making: "populatePk",
            },
            message: err.message
        };
        parentPort.postMessage(ret.succinctError);
        fse.remove(lockPath(dataPath, orgDir, metadata.id, metadata.revision));
        return;
    }
    const documents = pk.gqlQuerySync(`{docSet(id: """${docSetId}""") {documents { id bookCode: header(id:"bookCode")} } }`).data.docSet.documents.map(d => ({
        id: d.id,
        book: d.bookCode
    }));
    for (const doc of documents) {
        let docResult = null;
        try {
            docResult = pk.gqlQuerySync(`{ document(id: """${doc.id}""") { bookCode: header(id:"bookCode") perf } }`).data.document;
            const perfD = perfDir(dataPath, orgDir, metadata.id, metadata.revision);
            if (!fse.pathExistsSync(perfD)) {
                fse.mkdirsSync(perfD);
            }
            fse.writeFileSync(path.join(perfD, `${doc.book}.json`), JSON.stringify(JSON.parse(docResult.perf), null, 2));
        } catch (err) {
            docResult = null;
            parentPort.postMessage({
                generatedBy: 'cron',
                context: {
                    docSetId,
                    doc: doc.id,
                    book: doc.book,
                    making: "perf"
                },
                message: err.message,
            });
        }
        if (docResult) {
            try {
                const cl = new PerfRenderFromProskomma(
                    {
                        proskomma: pk,
                        actions: mergeActions(
                            [
                                render.perfToPerf.renderActions.justTheBibleActions,
                                render.perfToPerf.renderActions.identityActions
                            ]
                        ),
                    },
                );
                const output = {};

                cl.renderDocument(
                    {
                        docId: doc.id,
                        config: {},
                        output,
                    },
                );
                const simplePerf = render.perfToPerf.transforms.mergePerfTextCode({perf: output.perf}).perf;
                const simplePerfD = simplePerfDir(dataPath, orgDir, metadata.id, metadata.revision);
                if (!fse.pathExistsSync(simplePerfD)) {
                    fse.mkdirsSync(simplePerfD);
                }
                fse.writeFileSync(path.join(simplePerfD, `${doc.book}.json`), JSON.stringify(simplePerf, null, 2));
            } catch (err) {
                docResult = null;
                parentPort.postMessage({
                    generatedBy: 'cron',
                    context: {
                        docSetId,
                        doc: doc.id,
                        book: doc.book,
                        making: "simplePerf"
                    },
                    message: err.message,
                });
            }
        }
        if (docResult) {
            try {
                const cl = new PerfRenderFromProskomma(
                    {
                        proskomma: pk,
                        actions: documentStatsActions,
                    },
                );
                const output = {};

                cl.renderDocument(
                    {
                        docId: doc.id,
                        config: {},
                        output,
                    },
                );
                ret.stats.documents[doc.book] = output;
            } catch (err) {
                docResult = null;
                parentPort.postMessage({
                    generatedBy: 'cron',
                    context: {
                        docSetId,
                        doc: doc.id,
                        book: doc.book,
                        making: "stats"
                    },
                    message: err.message,
                });
            }
        }
        try {
            const docResult = pk.gqlQuerySync(`{document(id: """${doc.id}""") { bookCode: header(id:"bookCode") sofria } }`).data.document;
            const sofriaD = sofriaDir(dataPath, orgDir, metadata.id, metadata.revision);
            if (!fse.pathExistsSync(sofriaD)) {
                fse.mkdirsSync(sofriaD);
            }
            fse.writeFileSync(path.join(sofriaD, `${doc.book}.json`), JSON.stringify(JSON.parse(docResult.sofria), null, 2));
        } catch (err) {
            parentPort.postMessage({
                generatedBy: 'cron',
                context: {
                    docSetId,
                    doc: doc.id,
                    book: doc.book,
                    making: "sofria"
                },
                message: err.message,
            });
        }
    }
    try {
        for (const bookStats of Object.values(ret.stats.documents)) {
            for (const stat of [
                "nChapters",
                "nVerses",
                "nIntroductions",
                "nHeadings",
                "nFootnotes",
                "nXrefs",
                "nStrong",
                "nLemma",
                "nGloss",
                "nContent",
                "nMorph",
                "nOccurrences",
            ]) {
                ret.stats[stat] += bookStats[stat];
            }
            const metadataPath = path.join(
                transPath(
                    dataPath,
                    orgDir,
                    metadata.id,
                    metadata.revision
                ),
                'metadata.json'
            );
            const newMetadata = {...metadata, stats: ret.stats};
            fse.writeFileSync(metadataPath, JSON.stringify(newMetadata, null, 2));
        }
        try {
            if (!fse.pathExistsSync(succinctPath(dataPath, orgDir, metadata.id, metadata.revision))) {
                ret.succinct = pk.serializeSuccinct(docSetId);
            }
        } catch (err) {
            ret.succinctError = {
                generatedBy: 'cron',
                context: {
                    docSetId: docSetId || "???",
                    making: "succinct",
                },
                message: err.message
            };
            parentPort.postMessage(ret.succinctError);
            fse.remove(lockPath(dataPath, orgDir, metadata.id, metadata.revision));
            return;
        }
    } catch
        (err) {
        parentPort.postMessage({
            generatedBy: 'cron',
            context: {
                docSetId,
                making: "augmented metadata.json"
            },
            message: err.message,
        });
    }
    return ret;
}

parentPort.on("message", data => {
    doDownloads(data);
});
