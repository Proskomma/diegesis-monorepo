const path = require("path");
const languageCodes = require("../lib/languageCodes.json");
const { ApolloClient, gql, InMemoryCache} = require("@apollo/client");

async function getTranslationsCatalog() {

    const client = new ApolloClient(
        {
            cache: new InMemoryCache(),
            uri: 'https://diegesis.bible/graphql'
        }
    );
    const catalogQuery =`{
      localEntries {
        transId
        revision
        language
        title
      }
    }`;
    const catalogResult = await client.query({query: gql`${catalogQuery}`});
    const catalog = catalogResult.data.localEntries.map(t => ({
        resourceTypes: ["bible"],
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

module.exports = {getTranslationsCatalog, fetchUsfm, fetchUsx}
