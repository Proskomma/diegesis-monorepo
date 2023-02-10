const path = require("path");
const jszip = require("jszip");
const {ptBookArray} = require("proskomma-utils");
const languageCodes = require('../../lib/languageCodes.json');
const appRoot = path.resolve(".");
const {
    initializeEmptyEntry,
    deleteEntry,
    initializeEntryBookResourceCategory,
    lockEntry,
    unlockEntry,
    writeEntryBookResource,
    writeEntryMetadataJson,
} = require('../../lib/dataLayers/fs/');

async function getTranslationsCatalog() {

    const http = require(`${appRoot}/src/lib/http.js`);

    const catalogResponse = await http.getText('https://ebible.org/Scriptures/translations.csv');
    const catalogData = catalogResponse.data;
    const catalogRows = catalogData.split('\n')
        .map(r => r.slice(1, r.length - 1))
        .map(r => r.split(/", ?"/))

    const headers = catalogRows[0];
    const catalog = catalogRows.slice(1)
        .map(
            r => {
                const ret = {};
                headers.forEach((h, n) => ret[h] = r[n]);
                ret.downloadURL = `https://eBible.org/Scriptures/${ret.translationId}_usfm.zip`;
                return ret;
            }
        ).filter(t => t.languageCode)
        .map(t => ({
            source: "eBible",
            resourceTypes: ["bible"],
            id: t.translationId,
            languageCode: languageCodes[t.languageCode] || t.languageCode,
            title: t.title,
            downloadURL: `https://eBible.org/Scriptures/${t.translationId}_usfm.zip`,
            textDirection: t.textDirection,
            script: t.script,
            copyright: t.Copyright,
            description: t.description,
            abbreviation: t.translationId,
            owner: 'ebible',
            revision: t.UpdateDate,
        }));
    return catalog;
}

const fetchUsfm = async (org, trans, config) => {

    const http = require(`${appRoot}/src/lib/http.js`);
    try {
        initializeEmptyEntry(config, org, trans.id, trans.revision);
        lockEntry(config, org, trans.id, trans.revision, "ebible/translations");
        initializeEntryBookResourceCategory(
            config,
            org,
            trans.id,
            trans.revision,
            "original",
            "usfmBooks"
        );
        writeEntryMetadataJson(config, org, trans.id, trans.revision, trans);

        const downloadResponse = await http.getBuffer(trans.downloadURL);
        const zip = new jszip();
        await zip.loadAsync(downloadResponse.data);
        for (const bookName of ptBookArray) {
            const foundFiles = zip.file(new RegExp(`${bookName.code}[^/]*.usfm$`, 'g'));
            if (foundFiles.length === 1) {
                const fileContent = await foundFiles[0].async('text');
                writeEntryBookResource(
                    config,
                    org,
                    trans.id,
                    trans.revision,
                    "usfmBooks",
                    `${bookName.code}.usfm`,
                    fileContent
                );
            }
        }
        unlockEntry(config, org, trans.id, trans.revision);
    } catch (err) {
        console.log(err);
        deleteEntry(config, org, trans.id, trans.revision);
    }
};

const fetchUsx = async (org) => {
    throw new Error(`USX fetching is not supported for ${org.name}`)
};

module.exports = {getTranslationsCatalog, fetchUsfm, fetchUsx}
