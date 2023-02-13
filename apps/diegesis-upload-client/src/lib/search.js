function searchClause(searchTerms) {

    const listifyTerms = ts => ts.trim().split(/\s+/).map(t => `"""${t}"""`).join(' ');

    const featuresString = f => Object.entries(searchTerms.features)
        .filter(kv => kv[1])
        .map(kv => kv[0])
        .map(f => `"${f}"`).join(' ');

    const checkedFeatures = featuresString();

    const tidyField = str => str.toLocaleLowerCase().replace(/"/g, "").trim();

    return `(
        ${searchTerms.org !== "all" ? `sources: [${listifyTerms(searchTerms.org)}]`: ""}
        ${tidyField(searchTerms.owner).length > 0 ? `owners: [${listifyTerms(tidyField(searchTerms.owner))}]` : ''}
        ${tidyField(searchTerms.resourceType).length > 0 ? `types: [${listifyTerms(tidyField(searchTerms.resourceType))}]` : ''}
        ${tidyField(searchTerms.lang).length > 0 ? `languages: [${listifyTerms(tidyField(searchTerms.lang))}]` : ''}
        ${tidyField(searchTerms.text).length > 0 ? `titleMatching: """${tidyField(searchTerms.text)}"""` : ''}
        ${checkedFeatures.length > 0 ? `withStatsFeatures: [${checkedFeatures}]` : ""}
        sortedBy: """${searchTerms.sortField}"""
        reverse: ${searchTerms.sortDirection === "z-a"}
        )`;
}

function searchQuery(query, searchTerms) {
    return query
    .replace(
        '%searchClause%',
        searchClause(searchTerms)
    );
}

/*

 */
export {searchClause, searchQuery};
