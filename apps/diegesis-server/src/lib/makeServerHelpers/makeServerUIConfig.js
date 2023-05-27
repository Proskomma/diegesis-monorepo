const fse = require('fs-extra');
const path = require("path");

function makeServerUIConfig(config) {
    if (!config.initializeUIConfig) return
    //remove if directory all ready exist
    if (fse.existsSync(config.uiConfigPath)) {
        fse.removeSync(config.uiConfigPath)
    }
    //create new dir
    fse.mkdirSync(config.uiConfigPath, { recursive: true })

    const defaultUIConfigPath = path.resolve(config.resourcesPath, 'ui-config.json')
    //check default ui config exist or not
    if (!fse.existsSync(defaultUIConfigPath)) {
        throw Error(`default ui config file doesn\'t exist at ${defaultUIConfigPath}`)
    }
    //initialize default ui config
    fse.copyFileSync(defaultUIConfigPath, path.resolve(config.uiConfigPath, 'ui-config.json'))
}

module.exports = makeServerUIConfig;
