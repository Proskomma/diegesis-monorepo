const {Proskomma} = require('proskomma-core');
const {parentPort} = require("node:worker_threads");
const {
    lockEntry,
    unlockEntry,
    readEntryMetadata,
    writeEntryMetadata,
    writeSuccinctError,
} = require('./dataLayers/fs');
const getSuccinct = require("./makeDownloadsHelpers/makeSuccinct");
const doScripturePerf = require("./makeDownloadsHelpers/doScripturePerf")
const doScriptureSimplePerf = require("./makeDownloadsHelpers/doScriptureSimplePerf")
const doScriptureStats = require("./makeDownloadsHelpers/doScriptureStats");
const doScriptureSofria = require("./makeDownloadsHelpers/doScriptureSofria");
const makeAggregateStats = require("./makeDownloadsHelpers/makeAggregateStats");

const verbose = false;

function doScriptureDownloads({configString, org, transId, revision, contentType}) {
    if (!["usfm", "usx", "succinct"].includes(contentType)) {
        const contentTypeError = {
            generatedBy: 'cron',
            context: {
                making: "doScriptureDownloads",
            },
            message: `doScriptureDownloads() expects contentType of usfm, usx or succinct, not '${contentType}'`
        };
        parentPort.postMessage(contentTypeError);
        return;
    }
    const config = JSON.parse(configString);
    try {
        lockEntry(config, org, transId, revision, "makeDownloads");
        const metadata = readEntryMetadata(config, org, transId, revision);
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
            getSuccinct({config, org, pk, metadata, contentType, stats, verbose});
            const docSet = pk.gqlQuerySync('{docSets { id documents { bookCode: header(id: "bookCode") sequences {type} } } }').data.docSets[0];
            docSetId = docSet.id;
        } catch (err) {
            const succinctError = {
                generatedBy: 'cron',
                context: {
                    making: "populatePk",
                },
                message: err.message
            };
            parentPort.postMessage(succinctError);
            writeSuccinctError(config, org, metadata.id, metadata.revision, succinctError);
            unlockEntry(config, org, metadata.id, metadata.revision);
            throw new Error(`Succinct could not be generated: ${err.message}`);
        }
        // Iterate over documents
        const documents = pk.gqlQuerySync(`{docSet(id: """${docSetId}""") {documents { id bookCode: header(id:"bookCode")} } }`).data.docSet.documents.map(d => ({
            id: d.id,
            book: d.bookCode
        }));
        for (const doc of documents) {
            const success = doScripturePerf({config, org, pk, metadata, doc, docSetId, verbose});
            if (success) {
                doScriptureSimplePerf({config, org, pk, metadata, doc, docSetId, verbose});
                doScriptureStats({org, pk, metadata, doc, docSetId, stats, verbose});
            }
            doScriptureSofria({config, org, pk, metadata, doc, docSetId, verbose});
        }
        try {
            makeAggregateStats(stats);
            const newMetadata = {...metadata, stats};
            writeEntryMetadata(config, org, metadata.id, metadata.revision, newMetadata);
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
        // The end!
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
