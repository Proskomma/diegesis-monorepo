const path = require("path");
const fse = require('fs-extra');
const {
    orgEntries,
    unlockEntry,
    deleteGeneratedEntryContent,
} = require("../dataLayers/fs");

function makeServerDelete(config) {
    let orgs = config.orgs;
    if (config.localContent) {
        orgs.push(config.name);
    }
    for (const org of orgs) {
        for (const entryRecord of orgEntries(config, org)) {
            for (const revision of entryRecord.revisions) {
                unlockEntry(config, org, entryRecord.id, revision);
                if (config.deleteGenerated) {
                    deleteGeneratedEntryContent(config, org, entryRecord.id, revision);
                }
            }
        }
    }
}

module.exports = makeServerDelete;
