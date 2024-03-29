function searchClause(selectedOrg, searchLang, searchText, syncOnly) {

    const listifyTerms = ts => ts.trim().split(/\s+/).map(t => `"""${t.replace(/"/g, "")}"""`).join(' ')

    const searchString = `(
        ${searchLang.trim().length > 0 ? `withLanguageCode: [${listifyTerms(searchLang)}]` : ''}
        ${searchText.trim().length > 0 ? `withMatchingMetadata: [${listifyTerms(searchText)}]` : ''}
        ${syncOnly ? 'syncOnly: true' : ""}
        )`;
    return searchString.replace(/\s/g,"").length > 2 ? searchString : "";
}

function searchQuery(query, selectedOrg, searchLang, searchText, syncOnly) {
    return query.replace(
        '%org%',
        selectedOrg
    ).replace(
        '%searchClause%',
        searchClause(selectedOrg, searchLang, searchText, syncOnly)
    );
}

export {searchClause, searchQuery};
