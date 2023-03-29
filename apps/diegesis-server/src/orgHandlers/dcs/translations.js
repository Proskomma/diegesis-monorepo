const path = require("path");
const jszip = require("jszip");
const {ptBookArray} = require("proskomma-utils");
const languageCodes = require("../../lib/languageCodes.json");
const appRoot = path.resolve(".");
const {
    initializeEmptyEntry,
    deleteEntry,
    initializeEntryBookResourceCategory,
    lockEntry,
    unlockEntry,
    writeEntryResource,
    writeEntryBookResource,
    writeEntryMetadata,
} = require('../../lib/dataLayers/fs/');

async function getTranslationsCatalog(config, orgRecord) {

    const http = require(`${appRoot}/src/lib/http.js`);
    let configOwners = "unfoldingWord";
    if (orgRecord.config && orgRecord.config.owners && orgRecord.config.owners.length > 0) {
        configOwners = orgRecord.config.owners.join(',');
    }
    const catalogQuery = `https://git.door43.org/api/v1/repos/search?owner=${configOwners}&subject=Aligned%20Bible,Bible,Hebrew%20Old%20Testament,Greek%20New%20Testament`;
    const catalogResponse = await http.getText(catalogQuery);
    const jsonData = JSON.parse(catalogResponse.data);
    const catalogData = jsonData.data;
    const catalog = catalogData.map(t => ({
        source: "DCS",
        resourceTypes: ["bible"],
        id: `${t.id}`,
        languageCode: languageCodes[t[2]] || t.language,
        title: t.title.trim(),
        downloadURL: ` https://git.door43.org/api/v1/repos/${t.full_name}`,
        textDirection: t.language_direction,
        script: null,
        copyright: t.owner.full_name,
        description: t.description,
        abbreviation: t.name,
        owner: t.owner.login,
        revision: `${t.release_counter}`,
    }));
    return catalog;
}

const fetchUsfm = async (org, trans, config) => {
    const http = require(`${appRoot}/src/lib/http.js`);
    const repoDetailsResponse = await http.getText(trans.downloadURL);
    const responseJson = JSON.parse(repoDetailsResponse.data);
    const zipUrl = responseJson.catalog.prod.zipball_url;
    const downloadResponse = await http.getBuffer(zipUrl);
try {
    initializeEmptyEntry(config, org.name, trans.id, trans.revision);
    lockEntry(config, org.name, trans.id, trans.revision, "dcs/translations");
    initializeEntryBookResourceCategory(
        config,
        org.name,
        trans.id,
        trans.revision,
        "original",
        "usfmBooks"
    );
    writeEntryMetadata(config, org.name, trans.id, trans.revision, trans);
    const zip = new jszip();
    await zip.loadAsync(downloadResponse.data);
    for (const bookName of ptBookArray) {
        const foundFiles = zip.file(
            new RegExp(
                `${bookName.code}[^/]*.usfm$`,
                'g'
            )
        );
        if (foundFiles.length === 1) {
            const fileContent = await foundFiles[0].async('text');
            writeEntryBookResource(
                config,
                org.name,
                trans.id,
                trans.revision,
                "usfmBooks",
                `${bookName.code}.usfm`,
                fileContent
            );
        }
    }
    const vrsResponse = await http.getText(
        'https://git.door43.org/Door43-Catalog/versification/raw/branch/master/bible/ufw/ufw.vrs'
    );
    writeEntryResource(
        config,
        org.name,
        trans.id,
        trans.revision,
        "original",
        `versification.vrs`,
        vrsResponse.data
    );
    unlockEntry(config, org.name, trans.id, trans.revision);
} catch (err) {
    console.log(err);
    deleteEntry(config, org.name, trans.id, trans.revision);
}
};

const fetchUsx = async (org) => {throw new Error(`USX fetching is not supported for ${org.name}`)};

module.exports = { getTranslationsCatalog, fetchUsfm, fetchUsx }
