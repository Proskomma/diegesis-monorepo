const fse = require('fs-extra');
const path = require("path");
const peerTranslation = require("../peerTranslation");
const {orgExists, orgEntries, initializeOrg} = require("../dataLayers/fs");

const appRoot = path.resolve(".");

function maybeInitializeOrg(config, orgRecord) {
    if (!orgExists(config, orgRecord)) {
        config.verbose && console.log(`      Initializing org`);
        initializeOrg(config, orgRecord);
    }
}

async function setupNonPeerOrg(config, orgRecord) {
    maybeInitializeOrg(config, orgRecord);
    const translations = require(path.resolve(appRoot, 'src', 'orgHandlers', orgRecord.translationDir, 'translations.js'));
    const orgHandler = {
        getTranslationsCatalog: translations.getTranslationsCatalog,
        fetchUsfm: translations.fetchUsfm,
        fetchUsx: translations.fetchUsx,
    };
    const orgData = {
        orgDir: orgRecord.translationDir,
        name: orgRecord.name,
        fullName: orgRecord.fullName,
        contentType: orgRecord.contentType,
        translationDir: orgRecord.translationDir,
        catalogHasRevisions: orgRecord.catalogHasRevisions,
        canSync: true,
        entries: await orgHandler.getTranslationsCatalog(config, orgRecord),
        config: orgRecord.config || {}
    };
    return [orgHandler, orgData];
}

async function setupPeerOrg(config, orgRecord) {
    maybeInitializeOrg(config, orgRecord);
    const orgHandler = {
        getTranslationsCatalog: peerTranslation.getTranslationsCatalog,
        fetchUsfm: peerTranslation.fetchUsfm,
        fetchUsx: peerTranslation.fetchUsx,
        fetchSuccinct: peerTranslation.fetchSuccinct,
    };
    const orgData = {
        orgDir: orgRecord.translationDir,
        name: orgRecord.name,
        fullName: orgRecord.fullName,
        contentType: orgRecord.contentType,
        translationDir: orgRecord.translationDir,
        catalogHasRevisions: true,
        canSync: true,
        entries: await orgHandler.getTranslationsCatalog(orgRecord),
        config: orgRecord.config || {}
    };
    return [orgHandler, orgData];
}

async function setupLocalOrg(config) {
    maybeInitializeOrg(config, {translationDir: "_local"});
    const translations = require('../localTranslations');
    const orgHandler = {
        getTranslationsCatalog: translations.getTranslationsCatalog,
        fetchUsfm: translations.fetchUsfm,
        fetchUsx: translations.fetchUsx,
    };
    const orgData = {
        orgDir: "_local",
        name: config.name,
        fullName: config.name,
        contentType: "USFM",
        translationDir: "_local",
        catalogHasRevisions: false,
        canSync: false,
        entries: await orgHandler.getTranslationsCatalog(),
        config: {}
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
            "contentType": "succinct",
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
            const nLocal = orgEntries(config, orgRecord).length;
            config.verbose && console.log(`      ${nLocal} locally cached entr${nLocal === 1 ? "y" : "ies"}`);
        } else if (peerOrgs[org]) {
            const orgRecord = peerOrgs[org];
            orgName = orgRecord.name;
            [orgHandlers[orgName], orgsData[orgName]] = await setupPeerOrg(config, orgRecord);
            const nLocal = orgEntries(config, orgRecord).length;
            config.verbose && console.log(`      ${nLocal} locally cached entr${nLocal === 1 ? "y" : "ies"}`);
        } else if (org === config.name) {
            orgName = config.name;
            [orgHandlers[orgName], orgsData[orgName]] = await setupLocalOrg(config);
            const nLocal = orgEntries(config, {translationDir: "_local"}).length;
            config.verbose && console.log(`      ${nLocal} local entr${nLocal === 1 ? "y" : "ies"}`);
        } else {
            throw new Error(`No org called '${org}'`);
        }
    }
    return {orgsData, orgHandlers};
}

module.exports = makeServerOrgs;
