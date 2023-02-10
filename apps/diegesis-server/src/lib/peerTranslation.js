const path = require("path");
const fse = require('fs-extra');
const languageCodes = require("../lib/languageCodes.json");
const { ApolloClient, gql, InMemoryCache} = require("@apollo/client");
const {transPath} = require("./dataLayers/fs/dataPaths");

async function getTranslationsCatalog(orgRecord) {

    const peerUrl = orgRecord.config.peerUrl;
    const client = new ApolloClient(
        {
            cache: new InMemoryCache(),
            uri: peerUrl
        }
    );
    const catalogQuery =`{
      localEntries {
        source
        owner
        transId
        revision
        language
        title
      }
    }`;
    const catalogResult = await client.query({query: gql`${catalogQuery}`});
    const catalog = catalogResult.data.localEntries.map(t => ({
        resourceTypes: ["bible"],
        source: t.source,
        owner: t.owner,
        id: t.transId,
        revision: t.revision,
        languageCode: languageCodes[t.language] || t.language,
        title: t.title,
    }));
    return catalog;
}

const fetchUsfm = async (org) => {
    throw new Error(`USFM fetching is not supported for ${org.name}`)
};

const fetchUsx = async (org, trans, config) => {
    throw new Error(`USX fetching is not supported for ${org.name}`)
};

const fetchSuccinct = async (org, entryOrg, trans, config) => {
    const peerUrl = org.config.peerUrl;
    const client = new ApolloClient(
        {
            cache: new InMemoryCache(),
            uri: peerUrl
        }
    );
    const fetchQuery = `{
      localEntry(
        source: """${entryOrg.name}"""
        id: """${trans.id}"""
        revision: """${trans.revision}"""
        ) {
        source
        owner
        transId
        revision
        language
        title
        textDirection
        script
        copyright
        abbreviation
        succinct: canonResource(type: "succinct") {content}
      }
    }`;
    let fetchResult;
    try {
        fetchResult = await client.query({query: gql`${fetchQuery}`});
    } catch (err) {
        console.log(JSON.stringify(err));
    }
    const remoteLocalEntry = fetchResult.data.localEntry;
    const metadata = {
        source: remoteLocalEntry.source,
        resourceTypes: ["bible"],
        id: remoteLocalEntry.transId,
        languageCode: languageCodes[remoteLocalEntry.language] || remoteLocalEntry.language,
        title: remoteLocalEntry.title,
        textDirection: remoteLocalEntry.textDirection,
        script: remoteLocalEntry.script,
        copyright: remoteLocalEntry.copyright,
        description: remoteLocalEntry.title,
        abbreviation: remoteLocalEntry.abbreviation,
        owner: remoteLocalEntry.owner,
        revision: remoteLocalEntry.revision,
    }
    const tp = transPath(config.dataPath, entryOrg.translationDir, metadata.id, metadata.revision);
    if (!fse.pathExistsSync(tp)) {
        fse.mkdirsSync(tp);
    }
    try {
        fse.writeJsonSync(path.join(tp, "lock.json"), {actor: `peer/${org.config.name}/translations`, orgDir: org.translationDir, transId: metadata.id, revision: metadata.revision});
        fse.writeJsonSync(path.join(tp, 'metadata.json'), metadata);
        fse.mkdirsSync(path.join(tp, 'original'));
        fse.writeFileSync(path.join(tp, 'original', "succinct.json"), remoteLocalEntry.succinct.content);
        fse.remove(path.join(tp, "lock.json"));
    } catch (err) {
        console.log(err);
        fse.remove(tp);
    }
};

module.exports = {getTranslationsCatalog, fetchUsfm, fetchUsx, fetchSuccinct}
