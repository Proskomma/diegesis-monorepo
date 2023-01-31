const path = require("path");
const fse = require("fs-extra");
const jszip = require("jszip");
const {ptBookArray} = require("proskomma-utils");
const {transPath, vrsPath} = require('../../lib/dataPaths.js');
const languageCodes = require("../../lib/languageCodes.json");
const appRoot = path.resolve(".");

async function getTranslationsCatalog(config, orgRecord) {

    const http = require(`${appRoot}/src/lib/http.js`);
    let configOwners = "unfoldingWord";
    if (orgRecord.config && orgRecord.config.owners) {
        configOwners = orgRecord.config.owners.join(',');
    }
    const catalogResponse = await http.getText(`https://git.door43.org/api/v1/repos/search?owner=${configOwners}&subject=Aligned%20Bible,Bible,Hebrew%20Old%20Testament,Greek%20New%20Testament`);
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
    const zipUrl = responseJson.catalog.latest.zipball_url;
    const downloadResponse = await http.getBuffer(zipUrl);
    const tp = transPath(config.dataPath, org.translationDir, trans.id, trans.revision);
try {
    const usfmBooksPath = path.join(tp, 'original', 'usfmBooks');
    if (!fse.pathExistsSync(usfmBooksPath)) {
        fse.mkdirsSync(usfmBooksPath);
    }
    fse.writeJsonSync(path.join(tp, "lock.json"), {actor: "dcs/translations", orgDir: org.translationDir, transId: trans.id, revision: trans.revision});
    fse.writeJsonSync(path.join(tp, 'metadata.json'), trans);
    const zip = new jszip();
    await zip.loadAsync(downloadResponse.data);
    for (const bookName of ptBookArray) {
        const foundFiles = zip.file(new RegExp(`${bookName.code}[^/]*.usfm$`, 'g'));
        if (foundFiles.length === 1) {
            const fileContent = await foundFiles[0].async('text');
            fse.writeFileSync(path.join(usfmBooksPath, `${bookName.code}.usfm`), fileContent);
        }
    }
    const vrsResponse = await http.getText('https://git.door43.org/Door43-Catalog/versification/raw/branch/master/bible/ufw/ufw.vrs');
    fse.writeFileSync(vrsPath(config.dataPath, org.translationDir, trans.id, trans.revision), vrsResponse.data);
    fse.remove(path.join(tp, "lock.json"));
} catch (err) {
    console.log(err);
    fse.remove(tp);
}
};

const fetchUsx = async (org) => {throw new Error(`USX fetching is not supported for ${org.name}`)};

module.exports = { getTranslationsCatalog, fetchUsfm, fetchUsx }
