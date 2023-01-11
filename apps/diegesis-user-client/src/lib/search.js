function searchClause(searchTerms) {

    const listifyTerms = ts => ts.trim().split(/\s+/).map(t => `"${t}"`).join(' ');
    const featuresString = f => Object.entries(searchTerms.features)
        .filter(kv => kv[1])
        .map(kv => kv[0])
        .map(f => `"${f}"`).join(' ');

    return `(
        ${searchTerms.owner.trim().length > 0 ? `withOwner: [${listifyTerms(searchTerms.owner)}]` : ''}
        ${searchTerms.lang.trim().length > 0 ? `withLanguageCode: [${listifyTerms(searchTerms.lang)}]` : ''}
        ${searchTerms.text.trim().length > 0 ? `withMatchingMetadata: [${listifyTerms(searchTerms.text)}]` : ''}
        ${featuresString.length > 0 ? `withFeatures: [${featuresString(searchTerms.features)}]` : ""}
        reverse: ${searchTerms.sortDirection === "z-a"}
        )`;
}

function searchQuery(query, searchTerms) {
    return query
    .replace(
        '%searchClause%',
        ''
    );
}

export {searchClause, searchQuery};
