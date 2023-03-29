const path = require("path");
const appRoot = path.resolve(".");
const {
    initializeEmptyEntry,
    deleteEntry,
    initializeEntryBookResourceCategory,
    lockEntry,
    unlockEntry,
    writeEntryBookResource,
    writeEntryMetadata,
} = require('../../lib/dataLayers/fs/');

async function getTranslationsCatalog() {

    const http = require(`${appRoot}/src/lib/http.js`);

    let catalogResponse = null;
    try {
        catalogResponse = await http.getText('https://api.vachanengine.org/v2/sources?content_type=bible');
    } catch (err) {
        console.log(`    *** Error from Vachan sources endpoint: ${err.message} ***`);
    }
    if (!catalogResponse) {
        return;
    }
    const jsonData = JSON.parse(catalogResponse.data);
    const catalog = jsonData.map(t => ({
        source: "Vachan",
        resourceTypes: ["bible"],
        id: t.sourceName,
        languageCode: t.language.code,
        title: t.version.versionName,
        downloadURL: `https://api.vachanengine.org/v2/bibles/${t.sourceName}/books?content_type=usfm`,
        textDirection: t.language.scriptDirection.startsWith('right') ? 'rtl' : 'ltr',
        script: null,
        copyright: `${t.metaData['Copyright Holder'] || ''} ${t.license.code}`.trim(),
        description: t.metaData['Version Name (in Eng)'] || null,
        abbreviation: t.version.versionAbbreviation,
        revision: `${t.version.revision}`,
        owner: 'vachan2',
    }));
    return catalog;
}

const fetchUsfm = async (org, trans, config) => {
    try {
        initializeEmptyEntry(config, org.name, trans.id, trans.revision);
        lockEntry(config, org.name, trans.id, trans.revision, "vachan/translations");
        initializeEntryBookResourceCategory(
            config,
            org.name,
            trans.id,
            trans.revision,
            "original",
            "usfmBooks"
        );
        writeEntryMetadata(config, org.name, trans.id, trans.revision, trans);
        const http = require(`${appRoot}/src/lib/http.js`);
        const downloadResponse = await http.getText(trans.downloadURL);
        const responseJson = downloadResponse.data;
        for (const bookOb of JSON.parse(responseJson)) {
            const bookCode = bookOb.book.bookCode.toUpperCase();
            writeEntryBookResource(
                config,
                org.name,
                trans.id,
                trans.revision,
                "usfmBooks",
                `${bookCode}.usfm`,
                bookOb.USFM
            );
        }
        unlockEntry(config, org.name, trans.id, trans.revision);
    } catch (err) {
        console.log(err);
        deleteEntry(config, org.name, trans.id, trans.revision);
    }
}

    const fetchUsx = async (org) => {
    throw new Error(`USX fetching is not supported for ${org.name}`)
};

module.exports = {getTranslationsCatalog, fetchUsfm, fetchUsx}
