const fse = require('fs-extra');
const path = require("path");
const {orgPath} = require("../dataPaths");
const translations = require("../peerTranslations");

const appRoot = path.resolve(".");

function maybeMakeOrgDir(orgDir, config) {
    const orgFQPath = orgPath(config.dataPath, orgDir);
    if (!fse.existsSync(orgFQPath)) {
        config.verbose && console.log(`      Making org dir at ${orgFQPath}`);
        fse.mkdirSync(orgFQPath);
    }
}

async function setupNonPeerOrg(config, orgRecord) {
    const orgDir = orgRecord.translationDir;
    maybeMakeOrgDir(orgDir, config);
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
        catalogHasRevisions: orgRecord.catalogHasRevisions,
        canSync: true,
        entries: await orgHandler.getTranslationsCatalog(config),
    };
    return [orgHandler, orgData];
}

async function setupPeerOrg(config, orgRecord) {
    const orgDir = orgRecord.translationDir;
    maybeMakeOrgDir(orgDir, config);
    const translations = require('../peerTranslations');
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
        catalogHasRevisions: orgRecord.catalogHasRevisions,
        canSync: true,
        entries: await orgHandler.getTranslationsCatalog(),
    };
    return [orgHandler, orgData];
}

async function setupLocalOrg(config) {
    const orgDir = "_local";
    maybeMakeOrgDir(orgDir, config);
    const translations = require('../localTranslations');
    const orgHandler = {
        getTranslationsCatalog: translations.getTranslationsCatalog,
        fetchUsfm: translations.fetchUsfm,
        fetchUsx: translations.fetchUsx,
    };
    const orgData = {
        orgDir: orgDir,
        name: config.name,
        fullName: config.name,
        contentType: "USFM",
        translationDir: orgDir,
        catalogHasRevisions: false,
        canSync: false,
        entries: await orgHandler.getTranslationsCatalog(),
    };
    return [orgHandler, orgData];
}

async function makeServerOrgs(config) {
    const orgHandlers = {};
    const orgsData = {};
    config.verbose && console.log("  Loading org handlers");
    // Non-peer org lookup
    const nonPeerOrgs = {};
    for (const orgDir of fse.readdirSync(path.resolve(appRoot, 'src', 'orgHandlers'))) {
        const orgRecord = fse.readJsonSync(path.resolve(appRoot, 'src', 'orgHandlers', orgDir, 'org.json'));
        nonPeerOrgs[orgRecord.name] = {...orgRecord, config: {}};
    }
    // Peer org lookup, check for reused names
    const peerOrgs = {};
    for (const orgConfigRecord of config.orgsConfig.filter(org => org.peerUrl)) {
        if (nonPeerOrgs[orgConfigRecord.name]) {
            throw new Error(`orgsConfig for peer '${orgConfigRecord.name}' which is also a non-peer org`);
        }
        if (peerOrgs[orgConfigRecord.name]) {
            throw new Error(`Duplicate peer org name '${orgConfigRecord.name}'`);
        }
        if (orgConfigRecord.name === config.name) {
            throw new Error(`Peer org name '${orgConfigRecord.name}' is same as this server name`);
        }
        peerOrgs[orgConfigRecord.name] = {
            "translationDir": orgConfigRecord.name.toLowerCase(),
            "name": orgConfigRecord.name,
            "fullName": `Peer ${orgConfigRecord.name}`,
            "contentType": "USFM",
            "config": {}
        }
    }
    // Add orgsConfig to org lookups
    for (const orgConfig of config.orgsConfig) {
        if (nonPeerOrgs[orgConfig.name]) {
            nonPeerOrgs[orgConfig.name].config = orgConfig;
        } else if (orgConfig.name === config.name) {
        } else {
            peerOrgs[orgConfig.name].config = orgConfig;
        }
    }
    // Set up orgs
    let orgs = config.orgs.length > 0 ? config.orgs : Object.keys(nonPeerOrgs);
    if (config.localContent) {
        orgs.push(config.name);
    }
    for (const org of orgs) {
        config.verbose && console.log(`    ${org}`);
        let orgName;
        if (nonPeerOrgs[org]) {
            const orgRecord = nonPeerOrgs[org];
            orgName = orgRecord.name;
            [orgHandlers[orgName], orgsData[orgName]] = await setupNonPeerOrg(config, orgRecord);
        } else if (peerOrgs[org]) {
            const orgRecord = peerOrgs[org];
            orgName = orgRecord.name;
            [orgHandlers[orgName], orgsData[orgName]] = await setupPeerOrg(config, orgRecord);
        } else if (org === config.name) {
            orgName = config.name;
            [orgHandlers[orgName], orgsData[orgName]] = await setupLocalOrg(config);
        } else {
            throw new Error(`No org called '${org}'`);
        }
        const nLocal = fse.readdirSync(path.join(orgPath(config.dataPath, orgsData[orgName].translationDir))).length;
        config.verbose && console.log(`      ${nLocal}/${orgsData[orgName].entries.length} entr${nLocal === 1 ? "y" : "ies"} local`);
    }
    return {orgsData, orgHandlers};
}

module.exports = makeServerOrgs;
