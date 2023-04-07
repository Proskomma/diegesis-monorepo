const path = require('path');
const fse = require('fs-extra');

function resourceForLanguage(structurePath, resourcePath, resourceName, selectedLanguage, languages) {
    const resourceDirPath = path.join(structurePath, resourcePath);
    let ret = null;
    for (const language of [selectedLanguage, ...languages]) {
        if (fse.existsSync(path.join(resourceDirPath, language))) {
            try {
                ret = fse.readFileSync(path.join(resourceDirPath, language, resourceName)).toString();
            } catch (err) {
                throw new Error(`Could not find ${resourceName} for ${resourcePath} in language ${language}`)
            }
            break;
        }
    }
    if (!ret) {
        throw new Error(`Could not find content in any language for url '${resourcePath}'`);
    }

    return ret;
}

function serverClientStructure(config) {
    const ret = {};
    const structureJson = fse.readJsonSync(path.join(config.structurePath, 'structure.json'));
    ret.urls = structureJson.urls;
    ret.languages = {};
    for (const language of structureJson.languages) {
        const langMetadataJson = fse.readJsonSync(path.join(config.structurePath, 'metadata', `${language}.json`));
        ret.languages[language] = {
            ...langMetadataJson,
            footer: {},
            pages: {}
        };
        ret.languages[language].footer.body = resourceForLanguage(
            config.structurePath,
            'footer',
            'body.md',
            language,
            structureJson.languages
        );
        ret.languages[language].footer.menuText = "";
        for (const url of [...structureJson.urls, "home"]) {
            ret.languages[language].pages[url] = {};
            ret.languages[language].pages[url].body = resourceForLanguage(
                config.structurePath,
                `pages/${url}`,
                'body.md',
                language,
                structureJson.languages
            );
            ret.languages[language].pages[url].menuText = resourceForLanguage(
                config.structurePath,
                `pages/${url}`,
                'menu.txt',
                language,
                structureJson.languages
            );
        }
    }
    return ret;
}

module.exports = serverClientStructure;
