const path = require("path");

async function getTranslationsCatalog() {
    return [];
}

const fetchUsfm = async (org) => {
    throw new Error(`USFM fetching is not supported for ${org.name}`)
};

const fetchUsx = async (org) => {
    throw new Error(`USX fetching is not supported for ${org.name}`)
};

module.exports = {getTranslationsCatalog, fetchUsfm, fetchUsx}
