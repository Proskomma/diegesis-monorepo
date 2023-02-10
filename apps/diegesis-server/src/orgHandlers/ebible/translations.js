const path = require("path");
const fse = require("fs-extra");
const jszip = require("jszip");
const {ptBookArray} = require("proskomma-utils");
const {transPath} = require('../../lib/dataLayers/fs/dataPaths.js');
const languageCodes = require('../../lib/languageCodes.json');
const appRoot = path.resolve(".");

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
    const tp = transPath(config.dataPath, org.translationDir, trans.id, trans.revision);
    if (!fse.pathExistsSync(tp)) {
        fse.mkdirsSync(tp);
    }
    try {
        fse.writeJsonSync(path.join(tp, "lock.json"), {actor: "ebible/translations", orgDir: org.translationDir, transId: trans.id, revision: trans.revision});
        fse.writeJsonSync(path.join(tp, 'metadata.json'), trans);
        const downloadResponse = await http.getBuffer(trans.downloadURL);
        const usfmBooksPath = path.join(tp, 'original', 'usfmBooks');
        if (!fse.pathExistsSync(usfmBooksPath)) {
            fse.mkdirsSync(usfmBooksPath);
        }
        const zip = new jszip();
        await zip.loadAsync(downloadResponse.data);
        for (const bookName of ptBookArray) {
            const foundFiles = zip.file(new RegExp(`${bookName.code}[^/]*.usfm$`, 'g'));
            if (foundFiles.length === 1) {
                const fileContent = await foundFiles[0].async('text');
                fse.writeFileSync(path.join(usfmBooksPath, `${bookName.code}.usfm`), fileContent);
            }
        }
        fse.remove(path.join(tp, "lock.json"));
    } catch (err) {
        console.log(err);
        fse.remove(tp);
    }
};

const fetchUsx = async (org) => {
    throw new Error(`USX fetching is not supported for ${org.name}`)
};

module.exports = {getTranslationsCatalog, fetchUsfm, fetchUsx}
