function searchClause(selectedOrg, searchLang, searchText) {

    const listifyTerms = ts => ts.trim().split(/\s+/).map(t => `"""${t.replace(/"/g, "")}"""`).join(' ')

    return `(
        sources: [${listifyTerms(selectedOrg)}]
        ${searchLang.trim().length > 0 ? `languages: [${listifyTerms(searchLang)}]` : ''}
        ${searchText.trim().length > 0 ? `titleMatching: ${listifyTerms(searchText)}` : ''}
        sortedBy: "title"
        reverse: false
        )`;
}

function searchQuery(query, selectedOrg, searchLang, searchText) {
    return query.replace(
        '%searchClause%',
        searchClause(selectedOrg, searchLang, searchText)
    );
}

export {searchClause, searchQuery};
