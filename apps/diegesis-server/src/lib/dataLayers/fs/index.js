const fse = require('fs-extra');
const {orgPath, transPath, translationDir} = require("./dataPaths.js");
const path = require("path");

const checkResourceOrigin = v => {
    if (["original", "generated"].includes(v)) {
        throw new Error(`Resource origin should be 'original' or 'generated', not '${v}'`);
    }
}

const orgExists = (config, orgName) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in orgExists');
    }
    const orgP = orgPath(config.dataPath, translationDir(orgName));
    return fse.pathExistsSync(orgP)
}

const initializeOrg = (config, orgName) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in initializeOrg');
    }
    const orgP = orgPath(config.dataPath, translationDir(orgName));
    if (!fse.pathExistsSync(orgP)) {
        fse.mkdirsSync(orgP);
    }
}

const initializeEmptyEntry = (config, orgName, transId, transRevision) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in initializeEmptyEntry');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    if (!fse.pathExistsSync(tp)) {
        fse.mkdirsSync(tp);
    }
    const originalDir = path.join(tp, "original");
    if (!fse.pathExistsSync(originalDir)) {
        fse.mkdirsSync(originalDir);
    }
}

const orgEntries = (config, orgName) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in orgEntries');
    }
    const orgP = orgPath(
        config.dataPath,
        translationDir(orgName === config.name ? "_local" : orgName)
    );
    return fse.readdirSync(
        orgP
    )
        .map(e => ({
            id: e,
            revisions: fse.readdirSync(path.join(orgP, e))
        }))
}

const deleteEntry = (config, orgName, transId, transRevision) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in deleteEntry');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.remove(tp);
}

const deleteGeneratedEntryContent = (config, orgName, transId, transRevision) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in deleteGeneratedEntryContent');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.remove(path.join(tp, "generated"));
}

const lockEntry = (config, orgName, transId, transRevision, lockMsg) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in lockEntry');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.writeJsonSync(path.join(tp, "lock.json"), {actor: lockMsg, orgDir: translationDir(orgName), transId: transId, revision: transRevision});
}

const unlockEntry = (config, orgName, transId, transRevision) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in unlockEntry');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.remove(path.join(tp, "lock.json"));
}

const writeEntryMetadataJson = (config, orgName, transId, transRevision, content) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in writeEntryMetadataJson');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.writeJsonSync(path.join(tp, "metadata.json"), content);
}

const initializeEntryBookResourceCategory = (config, orgName, transId, transRevision, resourceOrigin, resourceCategory) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in initializeEntryBookResourceCategory');
    }
    checkResourceOrigin();
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    const booksPath = path.join(tp, resourceOrigin, resourceCategory);
    if (!fse.pathExistsSync(booksPath)) {
        fse.mkdirsSync(booksPath);
    }
}

const writeEntryResource = (config, orgName, transId, transRevision, resourceOrigin, resourceName, content) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in writeEntryResource');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.writeFileSync(path.join(tp, resourceOrigin, resourceName), content);
}

const writeEntryBookResource = (config, orgName, transId, transRevision, resourceCategory, resourceName, content) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in writeEntryBookResource');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    let resourceOrigin;
    if (fse.pathExistsSync(path.join(tp, "original", resourceCategory))) {
        resourceOrigin = "original";
    } else if (fse.pathExistsSync(path.join(tp, "original", resourceCategory))) {
        resourceOrigin = "generated";
    } else {
        throw new Error(`No book resource category '${resourceCategory}' for ${transId}/${transRevision}`);
    }
    fse.writeFileSync(path.join(tp, resourceOrigin, resourceCategory, resourceName), content);
}

module.exports = {
    initializeOrg,
    orgExists,
    orgEntries,
    initializeEmptyEntry,
    deleteEntry,
    deleteGeneratedEntryContent,
    initializeEntryBookResourceCategory,
    lockEntry,
    unlockEntry,
    writeEntryMetadataJson,
    writeEntryResource,
    writeEntryBookResource
}
