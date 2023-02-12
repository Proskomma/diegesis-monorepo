const fse = require('fs-extra');
const {
    orgPath,
    transPath,
    transParentPath,
    translationDir
} = require("./dataPaths.js");
const path = require("path");

// Utils

const checkResourceOrigin = v => {
    if (["original", "generated"].includes(v)) {
        throw new Error(`Resource origin should be 'original' or 'generated', not '${v}'`);
    }
}

// Orgs

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

// Entries

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
    if (fse.pathExistsSync(tp)) {
        throw new Error(`Entry ${orgName}/${transId}/${transRevision} already exists in initializeEmptyEntry`);
    }
    fse.mkdirsSync(tp);
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

const _EntryResources = (config, orgName, transId, transRevision, resourceOrigin) => {
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    const resourceDirPath = path.join(tp, resourceOrigin);
    if (fse.pathExistsSync(resourceDirPath)) {
        return fse.readdirSync(resourceDirPath)
            .filter(p => !fse.lstatSync(path.join(tp, resourceOrigin, p)).isDirectory())
            .map(p => ({
                type: p.split('.')[0],
                isOriginal: (resourceOrigin === "original"),
                content: readEntryResource(config, orgName, transId, transRevision, p),
                suffix: p.split('.')[1]
            }));
    } else {
        return [];
    }
}

const originalEntryResources = (config, orgName, transId, transRevision) => {
    return _EntryResources(config, orgName, transId, transRevision, "original");
}

const generatedEntryResources = (config, orgName, transId, transRevision) => {
    return _EntryResources(config, orgName, transId, transRevision, "generated");
}
const entryResources = (config, orgName, transId, transRevision) => {
    return [
        ...originalEntryResources(config, orgName, transId, transRevision),
        ...generatedEntryResources(config, orgName, transId, transRevision)
    ];
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

const entryBookResources = (config, orgName, transId, transRevision, bookResourceCategory) => {
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in entryBookResources');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    let resourceOrigin;
    if (fse.pathExistsSync(path.join(tp, "original", bookResourceCategory))) {
        resourceOrigin = "original";
    }
    if (fse.pathExistsSync(path.join(tp, "generated", bookResourceCategory))) {
        resourceOrigin = "generated";
    }
    if (!resourceOrigin) {
        throw new Error(`Resource category ${bookResourceCategory} not found for ${orgName}/${transId}/${transRevision}`);
    }
    return fse.readdirSync(path.join(tp, resourceOrigin, bookResourceCategory));
}

// Entry Tests

const entryExists = (config, orgName, transId, transRevision) => {
    const tp = transParentPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision);
    return fse.pathExistsSync(tp);
}

const entryRevisionExists = (config, orgName, transId) => {
    const tpp = transParentPath(
        config.dataPath,
        translationDir(orgName),
        transId);
    return fse.pathExistsSync(tpp);
}

const entryIsLocked = (config, orgName, transId, transRevision) => {
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    return fse.pathExistsSync(path.join(tp, "lock.json"));
};

const entryHasSuccinctError = (config, orgName, transId, transRevision) => {
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    return fse.pathExistsSync(path.join(tp, "succinctError.json"));
};

const entryHasGeneratedContent = (config, orgName, transId, transRevision) => {
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    return fse.pathExistsSync(path.join(tp, "generated"));
};

const entryHasOriginal = (config, orgName, transId, transRevision, contentType) => {
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    return fse.pathExistsSync(path.join(tp, "original", contentType));
};

const entryHasGenerated = (config, orgName, transId, transRevision, contentType) => {
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    return fse.pathExistsSync(path.join(tp, "generated", contentType));
};

const entryHas = (config, orgName, transId, transRevision, contentType) => {
    return entryHasOriginal(config, orgName, transId, transRevision, contentType) ||
        entryHasGenerated(config, orgName, transId, transRevision, contentType);
};

const entryHasOriginalBookResourceCategory = (config, orgName, transId, transRevision, contentType) => {
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    const rcPath = path.join(tp, "original", contentType);
    return fse.pathExistsSync(rcPath) && fse.lstatSync(rcPath).isDirectory();
};

const entryHasGeneratedBookResourceCategory = (config, orgName, transId, transRevision, contentType) => {
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    const rcPath = path.join(tp, "generated", contentType);
    return fse.pathExistsSync(rcPath) && fse.lstatSync(rcPath).isDirectory();
};

const entryHasBookSourceCategory = (config, orgName, transId, transRevision, contentType) => {
    return entryHasOriginalBookResourceCategory(config, orgName, transId, transRevision, contentType) ||
        entryHasGeneratedBookResourceCategory(config, orgName, transId, transRevision, contentType);
};

// Lock/Unlock

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

// Succinct error

const writeSuccinctError = (config, orgName, transId, transRevision, succinctErrorJson) => {
    // Expect and write JSON
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.writeJsonSync(path.join(tp, "succinctError.json"), succinctErrorJson);
};

const deleteSuccinctError = (config, orgName, transId, transRevision) => {
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.remove(path.join(tp, "succinctError.json"));
};

// Read

const readEntryMetadata = (config, orgName, transId, transRevision) => {
    // Returns JSON
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in readEntryMetadataJson');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    return fse.readJsonSync(path.join(tp, "metadata.json"));
}

const readEntryResource = (config, orgName, transId, transRevision, resourceName) => {
    // Returns JSON or a string depending on resourceName suffix
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in readEntryResource');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    let rawRead;
    if (fse.pathExistsSync(path.join(tp, "original", resourceName))) {
        rawRead = fse.readFileSync(path.join(tp, "original", resourceName));
    }
    if (fse.pathExistsSync(path.join(tp, "generated", resourceName))) {
        rawRead = fse.readFileSync(path.join(tp, "generated", resourceName));
    }
    if (!rawRead) {
        return null;
    }
    if (resourceName.endsWith('.json')) {
        return JSON.parse(rawRead.toString());
    } else {
        return rawRead.toString();
    }
}

const readEntryBookResource = (config, orgName, transId, transRevision, resourceCategory, resourceName) => {
    // Returns JSON or a string depending on resourceName suffix
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in readEntryBookResource');
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
    } else if (fse.pathExistsSync(path.join(tp, "generated", resourceCategory))) {
        resourceOrigin = "generated";
    } else {
        throw new Error(`No book resource category '${resourceCategory}' for ${transId}/${transRevision}`);
    }
    if (!fse.pathExistsSync(tp, resourceOrigin, resourceCategory, resourceName)) {
        throw new Error(`Book resource ${resourceCategory}/${resourceName} not found for ${orgName}/${transId}/${transRevision}`);
    }
    const rawRead = fse.readFileSync(path.join(tp, resourceOrigin, resourceCategory, resourceName));
    if (resourceName.endsWith('.json')) {
        return JSON.parse(rawRead.toString());
    } else {
        return rawRead.toString();
    }
}

// Write

const writeEntryBookResource = (config, orgName, transId, transRevision, resourceCategory, resourceName, rawContent) => {
    // Convert JSON to string before writing according to resourceName suffix
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
    } else if (fse.pathExistsSync(path.join(tp, "generated", resourceCategory))) {
        resourceOrigin = "generated";
    } else {
        throw new Error(`No book resource category '${resourceCategory}' for ${transId}/${transRevision}`);
    }
    const content = resourceName.endsWith('.json') ? JSON.stringify(rawContent) : rawContent;
    fse.writeFileSync(path.join(tp, resourceOrigin, resourceCategory, resourceName), content);
}

const writeEntryMetadata = (config, orgName, transId, transRevision, contentJson) => {
    // Expect and write JSON
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in writeEntryMetadataJson');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.writeJsonSync(path.join(tp, "metadata.json"), contentJson);
}

const writeEntryResource = (config, orgName, transId, transRevision, resourceOrigin, resourceName, rawContent) => {
    // Convert JSON to string before writing according to resourceName suffix
    if (!(typeof orgName === "string")) {
        throw new Error('orgName should be string in writeEntryResource');
    }
    const tp = transPath(
        config.dataPath,
        translationDir(orgName),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    const content = resourceName.endsWith('.json') ? JSON.stringify(rawContent) : rawContent;
    fse.writeFileSync(path.join(tp, resourceOrigin, resourceName), content);
}

module.exports = {
    initializeOrg,
    orgExists,
    orgEntries,
    initializeEmptyEntry,
    deleteEntry,
    deleteGeneratedEntryContent,
    initializeEntryBookResourceCategory,
    entryBookResources,
    lockEntry,
    unlockEntry,
    readEntryMetadata,
    writeEntryMetadata,
    readEntryResource,
    writeEntryResource,
    readEntryBookResource,
    writeEntryBookResource,
    entryIsLocked,
    entryHasSuccinctError,
    entryHasGeneratedContent,
    entryHas,
    entryHasOriginal,
    entryHasGenerated,
    writeSuccinctError,
    deleteSuccinctError,
    entryExists,
    entryRevisionExists,
    entryHasBookSourceCategory,
    entryHasOriginalBookResourceCategory,
    entryHasGeneratedBookResourceCategory,
    originalEntryResources,
    generatedEntryResources,
    entryResources,
}
