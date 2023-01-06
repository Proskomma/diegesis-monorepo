const fse = require('fs-extra');
const path = require("path");
const {orgPath} = require("./dataPaths");

const appRoot = path.resolve(".");

async function makeServerOrgs(config) {
    const orgHandlers = {};
    const orgsData = {};
    config.verbose && console.log("Diegesis Server");
    config.verbose && console.log("  Loading org handlers");
    let loadedSomething = false;
    for (const orgDir of fse.readdirSync(path.resolve(appRoot, 'src', 'orgHandlers'))) {
        if (orgDir === 'localusx' && !config.localUsxPath) {
            continue;
        }
        if (orgDir === 'localusfm' && !config.localUsfmPath) {
            continue;
        }
        const orgRecord = fse.readJsonSync(path.resolve(appRoot, 'src', 'orgHandlers', orgDir, 'org.json'));
        if (config.orgs.length > 0 && !config.orgs.includes(orgRecord.name)) {
            continue;
        }
        config.verbose && console.log(`    ${orgRecord.name}`);
        const orgFQPath = orgPath(config.dataPath, orgDir);
        if (!fse.existsSync(orgFQPath)) {
            config.verbose && console.log(`      Making org dir at ${orgFQPath}`);
            fse.mkdirSync(orgFQPath);
        }
        const translations = require(path.resolve(appRoot, 'src', 'orgHandlers', orgDir, 'translations.js'));
        orgHandlers[orgRecord.name] = {
            getTranslationsCatalog: translations.getTranslationsCatalog,
            fetchUsfm: translations.fetchUsfm,
            fetchUsx: translations.fetchUsx,
        };
        orgsData[orgRecord.name] = {
            orgDir: orgDir,
            name: orgRecord.name,
            fullName: orgRecord.fullName,
            contentType: orgRecord.contentType,
            translationDir: orgRecord.translationDir,
            translations: await orgHandlers[orgRecord.name].getTranslationsCatalog(config),
        };
        loadedSomething = true;
    }
    if (!loadedSomething) {
        console.log('Error: no org handlers loaded: check or remove orgs array in config file');
        process.exit(1);
    }
    return {orgsData, orgHandlers};
}

module.exports = makeServerOrgs;
