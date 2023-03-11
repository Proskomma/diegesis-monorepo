const {
    entryHas,
    readEntryResource,
    entryBookResourcesForCategory,
    readEntryBookResource,
    writeEntryResource
} = require("../dataLayers/fs");
const {ptBooks} = require('proskomma-utils');
const {parentPort} = require("node:worker_threads");
const path = require("path");

function getSuccinct({config, org, pk, metadata, contentType, stats, verbose}) {
    let docSetId;
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
        const bookResources = entryBookResourcesForCategory(config, org, metadata.id, metadata.revision, `${contentType}Books`);
        const bookContent = bookResources.map(r => readEntryBookResource(config, org, metadata.id, metadata.revision, `${contentType}Books`, r));
        if (["usfm", "usx", "succinct"].includes(contentType)) {
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
            if (entryHas(config, org, metadata.id, metadata.revision, "versification.vrs")) {
                const vrsContent = readEntryResource(config, org, metadata.id, metadata.revision, "versification.vrs");
                pk.gqlQuerySync(`mutation { setVerseMapping(docSetId: "${docSetId}" vrsSource: """${vrsContent}""")}`);
            }
        } else {
            const tsvToTable = (tsv, hasHeadings) => {
                const ret = {
                    headings: [],
                    rows: [],
                };
                let rows = tsv.split(/[\n\r]+/);

                if (hasHeadings) {
                    ret.headings = rows[0].split('\t');
                    rows = rows.slice(1);
                }

                for (const row of rows) {
                    ret.rows.push(row.split('\t'));
                }
                return ret;
            };
            const booksContent = bookContent
                .map(
                    bc => bc.split('\n')
                        .slice(1)
                        .map(l => l.trim())
                        .join('\n')
                )
                .join('\n');
            pk.importDocument({
                    source: org,
                    project: metadata.id,
                    revision: metadata.revision,
                },
                'tsv',
                JSON.stringify(
                    tsvToTable(
                        booksContent,
                        false,
                    ),
                    null,
                    2,
                )
            )
        }
        const docSet = pk.gqlQuerySync('{docSets { id documents { bookCode: header(id: "bookCode") sequences {type} } } }').data.docSets[0];
        docSetId = docSet.id;
        const succinct = pk.serializeSuccinct(docSetId);
        writeEntryResource(config, org, metadata.id, metadata.revision, "generated", "succinct.json", succinct);
    }
    if (verbose) {
        parentPort.postMessage({
                org,
                transId: metadata.id,
                revision: metadata.revision,
                status: "getSuccinct"
            }
        )
    }
}

module.exports = getSuccinct;
