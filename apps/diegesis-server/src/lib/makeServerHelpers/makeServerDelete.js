const path = require("path");
const fse = require('fs-extra');

function makeServerDelete(config) {
    for (const org of fse.readdirSync(config.dataPath)) {
        const orgDir = path.join(config.dataPath, org);
        if (fse.pathExistsSync(orgDir) && fse.lstatSync(orgDir).isDirectory()) {
            for (const trans of fse.readdirSync(orgDir)) {
                const transDir = path.join(orgDir, trans);
                for (const revision of fse.readdirSync(transDir)) {
                    const revisionDir = path.join(transDir, revision);
                    for (
                        const toRemove of (
                        config.deleteGenerated ?
                            ["lock.json", "generated"] :
                            ["lock.json"]
                    )
                        ) {
                        fse.remove(path.join(revisionDir, toRemove));
                    }
                }
            }
        }
    }
}

module.exports = makeServerDelete;
