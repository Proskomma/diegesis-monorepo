const fse = require('fs-extra');
const path = require("path");

function makeServerUIConfig(config) {
    if (!config.initializeUIConfig) return
    const dirPath = path.resolve(config.uiConfigPath)
    if (fse.existsSync(dirPath)) {
        fse.removeSync(dirPath)
    }
    fse.mkdirSync(dirPath, { recursive: true });
    //@todo:: copy default ui config value and past it in user defined ui config.
}

module.exports = makeServerUIConfig;
