const fse = require('fs-extra');
const path = require("path");
const {orgPath} = require("./dataPaths");

const appRoot = path.resolve(".");

async function setupNonPeerOrg(config, orgRecord) {
    const orgDir = orgRecord.translationDir;
    const orgFQPath = orgPath(config.dataPath, orgDir);
    if (!fse.existsSync(orgFQPath)) {
        config.verbose && console.log(`      Making org dir at ${orgFQPath}`);
        fse.mkdirSync(orgFQPath);
    }
    const translations = require(path.resolve(appRoot, 'src', 'orgHandlers', orgDir, 'translations.js'));
    const orgHandler = {
        getTranslationsCatalog: translations.getTranslationsCatalog,
        fetchUsfm: translations.fetchUsfm,
        fetchUsx: translations.fetchUsx,
    };
    const orgData = {
        orgDir: orgDir,
        name: orgRecord.name,
        fullName: orgRecord.fullName,
        contentType: orgRecord.contentType,
        translationDir: orgRecord.translationDir,
        translations: await orgHandler.getTranslationsCatalog(config),
    };
    return [orgHandler, orgData];
}

async function makeServerOrgs(config) {
    const orgHandlers = {};
    const orgsData = {};
    config.verbose && console.log("  Loading org handlers");
    const nonPeerOrgs = {};
    for (const orgDir of fse.readdirSync(path.resolve(appRoot, 'src', 'orgHandlers'))) {
        const orgRecord = fse.readJsonSync(path.resolve(appRoot, 'src', 'orgHandlers', orgDir, 'org.json'));
        nonPeerOrgs[orgRecord.name] = orgRecord;
    }
    const orgs = config.orgs.length > 0 ? config.orgs : Object.keys(nonPeerOrgs);
    for (const org of orgs) {
        config.verbose && console.log(`    ${org}`);
        if (nonPeerOrgs[org]) {
            const orgRecord = nonPeerOrgs[org];
            [orgHandlers[orgRecord.name], orgsData[orgRecord.name]] = await setupNonPeerOrg(config, orgRecord);
        } else {
            throw new Error(`No org called '${org}'`);
        }
    }
    return {orgsData, orgHandlers};
}

module.exports = makeServerOrgs;
