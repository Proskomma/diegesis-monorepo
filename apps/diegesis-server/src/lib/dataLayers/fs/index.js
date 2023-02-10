const fse = require('fs-extra');
const {transPath} = require("./dataPaths.js");
const path = require("path");

const checkResourceOrigin = v => {
    if (["original", "generated"].includes(v)) {
        throw new Error(`Resource origin should be 'original' or 'generated', not '${v}'`);
    }
}

const initializeEmptyEntry = (config, orgRecord, transId, transRevision) => {
    const tp = transPath(
        config.dataPath,
        orgRecord.translationDir.replace(/\s/g, "__"),
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

const deleteEntry = (config, orgRecord, transId, transRevision) => {
    const tp = transPath(
        config.dataPath,
        orgRecord.translationDir.replace(/\s/g, "__"),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.remove(tp);
}

const lockEntry = (config, orgRecord, transId, transRevision, lockMsg) => {
    const tp = transPath(
        config.dataPath,
        orgRecord.translationDir.replace(/\s/g, "__"),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.writeJsonSync(path.join(tp, "lock.json"), {actor: lockMsg, orgDir: orgRecord.translationDir, transId: transId, revision: transRevision});
}

const unlockEntry = (config, orgRecord, transId, transRevision) => {
    const tp = transPath(
        config.dataPath,
        orgRecord.translationDir.replace(/\s/g, "__"),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.remove(path.join(tp, "lock.json"));
}

const writeEntryMetadataJson = (config, orgRecord, transId, transRevision, content) => {
    const tp = transPath(
        config.dataPath,
        orgRecord.translationDir.replace(/\s/g, "__"),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.writeJsonSync(path.join(tp, "metadata.json"), content);
}

const initializeEntryBookResourceCategory = (config, orgRecord, transId, transRevision, resourceOrigin, resourceCategory) => {
    checkResourceOrigin();
    const tp = transPath(
        config.dataPath,
        orgRecord.translationDir.replace(/\s/g, "__"),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    const booksPath = path.join(tp, resourceOrigin, resourceCategory);
    if (!fse.pathExistsSync(booksPath)) {
        fse.mkdirsSync(booksPath);
    }
}

const writeEntryResource = (config, orgRecord, transId, transRevision, resourceOrigin, resourceName, content) => {
    const tp = transPath(
        config.dataPath,
        orgRecord.translationDir.replace(/\s/g, "__"),
        transId,
        transRevision.replace(/\s/g, "__")
    );
    fse.writeFileSync(path.join(tp, resourceOrigin, resourceName), content);
}

const writeEntryBookResource = (config, orgRecord, transId, transRevision, resourceCategory, resourceName, content) => {
    const tp = transPath(
        config.dataPath,
        orgRecord.translationDir.replace(/\s/g, "__"),
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
    initializeEmptyEntry,
    deleteEntry,
    initializeEntryBookResourceCategory,
    lockEntry,
    unlockEntry,
    writeEntryMetadataJson,
    writeEntryResource,
    writeEntryBookResource
}
