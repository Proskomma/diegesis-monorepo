const {Proskomma} = require('proskomma-core');
const {PerfRenderFromProskomma, render, mergeActions} = require('proskomma-json-tools');
const {ptBooks} = require('proskomma-utils');
const {parentPort} = require("node:worker_threads");
const {
    lockEntry,
    unlockEntry,
    readEntryMetadata,
    writeEntryMetadata,
    entryHasGenerated,
    entryHas,
    initializeEntryBookResourceCategory,
    entryBookResourcesForCategory,
    readEntryResource,
    readEntryBookResource,
    writeEntryResource,
    writeEntryBookResource,
    writeSuccinctError,
} = require('./dataLayers/fs');
const documentStatsActions = require("./documentStatsActions");

function doScriptureDownloads({configString, org, transId, revision, contentType}) {
    const config = JSON.parse(configString);
    try {
        lockEntry(config, org, transId, revision, "makeDownloads");
        const metadata = readEntryMetadata(config, org, transId, revision);
        let bookContent = null;
        if (["usfm", "usx"].includes(contentType)) {
            const bookResources = entryBookResourcesForCategory(config, org, transId, revision, `${contentType}Books`);
            bookContent = bookResources.map(r => readEntryBookResource(config, org, transId, revision, `${contentType}Books`, r));
        } else {
            const contentTypeError = {
                generatedBy: 'cron',
                context: {
                    making: "doScriptureDownloads",
                },
                message: `doScriptureDownloads() expects contentType of usfm or usx, not '${contentType}'`
            };
            parentPort.postMessage(contentTypeError);
            unlockEntry(config, org, metadata.id, metadata.revision);
            return;
        }
        let vrsContent = null;
        if (entryHas(config, org, transId, revision, "versification.vrs")) {
            vrsContent = readEntryResource(config, org, transId, revision, "versification.vrs");
        }
        let pk;
        let docSetId;
        let stats = {
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
        };
        try {
            // Set up Proskomma
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
            // Load or make succinct
            if (entryHas(config, org, metadata.id, metadata.revision, "succinct.json")) {
                // Load existing succinct and extract book stats info from it
                const succinct = readEntryResource(config, org, metadata.id, metadata.revision, "succinct.json");
                pk.loadSuccinctDocSet(succinct);
                const docSetTags = pk.gqlQuerySync('{docSets { tagsKv {key value} } }').data.docSets[0].tagsKv;
                for (const kv of docSetTags) {
                    if (["nOT", "nNT", "nDC"].includes(kv.key)) {
                        stats[kv.key] = kv.value;
                    }
                }
            } else {
                // Load books, calculate section stats from books and add this and other tags to docSet, then export succinct
                pk.importDocuments(
                    {
                        source: org,
                        project: metadata.id,
                        revision: metadata.revision,
                    },
                    contentType,
                    bookContent,
                );
                const docSet = pk.gqlQuerySync('{docSets { id documents { bookCode: header(id: "bookCode") sequences {type} } } }').data.docSets[0];
                docSetId = docSet.id;
                const docSetBookCodes = docSet.documents.map(d => d.bookCode);
                for (const bookCode of docSetBookCodes) {
                    for (const section of ['ot', 'nt', 'dc']) {
                        if (ptBooks[bookCode].categories.includes(section)) {
                            stats[`n${section.toUpperCase()}`]++;
                        }
                    }
                }
                let metadataTags = `"title:${metadata.title}" "copyright:${metadata.copyright}" "language:${metadata.languageCode}" """owner:${metadata.owner}"""`;
                metadataTags += ` "nOT:${stats.nOT}" "nNT:${stats.nNT}" "nDC:${stats.nDC}"`;
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
                const succinct = pk.serializeSuccinct(docSetId);
                writeEntryResource(config, org, transId, revision, "generated", "succinct.json", succinct);
            }
        } catch (err) {
            const succinctError = {
                generatedBy: 'cron',
                context: {
                    docSetId: docSetId || "???",
                    making: "populatePk",
                },
                message: err.message
            };
            parentPort.postMessage(succinctError);
            writeSuccinctError(config, org, metadata.id, metadata.revision, succinctError);
            unlockEntry(config, org, metadata.id, metadata.revision);
            throw new Error(`Succinct could not be generated: abandoning`);
        }
        // Iterate over documents
        const documents = pk.gqlQuerySync(`{docSet(id: """${docSetId}""") {documents { id bookCode: header(id:"bookCode")} } }`).data.docSet.documents.map(d => ({
            id: d.id,
            book: d.bookCode
        }));
        for (const doc of documents) {
            let docResult = null;
            try {
                docResult = pk.gqlQuerySync(`{ document(id: """${doc.id}""") { bookCode: header(id:"bookCode") perf } }`).data.document;
                if (!entryHasGenerated(config, org, metadata.id, metadata.revision, "perfBooks")) {
                    initializeEntryBookResourceCategory(
                        config,
                        org,
                        metadata.id,
                        metadata.revision,
                        "generated",
                        "perfBooks"
                    );
                }
                writeEntryBookResource(
                    config,
                    org,
                    metadata.id,
                    metadata.revision,
                    "perfBooks",
                    `${doc.book}.json`,
                    JSON.parse(docResult.perf)
                );
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
                    if (!entryHasGenerated(config, org, metadata.id, metadata.revision, "simplePerfBooks")) {
                        initializeEntryBookResourceCategory(
                            config,
                            org,
                            metadata.id,
                            metadata.revision,
                            "generated",
                            "simplePerfBooks"
                        );
                    }
                    writeEntryBookResource(
                        config,
                        org,
                        metadata.id,
                        metadata.revision,
                        "simplePerfBooks",
                        `${doc.book}.json`,
                        JSON.parse(docResult.perf)
                    );
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
                    stats.documents[doc.book] = output;
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
                if (!entryHasGenerated(config, org, metadata.id, metadata.revision, "sofriaBooks")) {
                    initializeEntryBookResourceCategory(
                        config,
                        org,
                        metadata.id,
                        metadata.revision,
                        "generated",
                        "sofriaBooks"
                    );
                }
                writeEntryBookResource(
                    config,
                    org,
                    metadata.id,
                    metadata.revision,
                    "sofriaBooks",
                    `${doc.book}.json`,
                    JSON.parse(docResult.sofria)
                );
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
            for (const bookStats of Object.values(stats.documents)) {
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
                    stats[stat] += bookStats[stat];
                }
                const newMetadata = {...metadata, stats};
                writeEntryMetadata(config, org, metadata.id, metadata.revision, newMetadata);
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
        unlockEntry(config, org, transId, revision);
        parentPort.postMessage({org, transId, revision, status: "done"});
    } catch (err) {
        const succinctError = {
            generatedBy: 'cron',
            context: {
                org,
                transId,
                revision,
                contentType
            },
            message: err.message
        };
        parentPort.postMessage(succinctError);
        unlockEntry(config, org, transId, revision);
    }
}

parentPort.on("message", data => {
    doScriptureDownloads(data);
});
