const {gql} = require("apollo-server-express");

const scalarSchema = gql`
    scalar OrgName
    scalar EntryId
    scalar BookCode
    scalar ContentType
    `;

const querySchema = gql`
    type Query {
        """A list of organizations from which this server can serve data"""
        orgs: [Org!]!
        """The organization with the given name, if found"""
        org(
            """The name of the organization"""
            name: OrgName!
        ): Org
    
        """Entries available across all sources on this server"""
        localEntries(
            """Only entries from these sources"""
            sources:  [String!]
            """Only entries from these owners"""
            owners:  [String!]
            """Only entries from these types"""
            types:  [String!]
            """Only entries with these ids"""
            ids:  [String!]
            """Only entries with these languages"""
            languages:  [String!]
            """Only entries with title matching regex"""
            titleMatching: String
            """Only entries with stats features"""
            withStatsFeatures: [String!]
            """Sort field"""
            sortedBy: String
            """Sort in reverse order"""
            reverse: Boolean
        ) : [LocalEntry!]!
        
        """An entry, by primary key, if it exists"""
        localEntry(
            """The entry source"""
            source: String!
            """The entry id"""
            id: String!
            """The entry revision"""
            revision: String!
        ): LocalEntry
    }
    
    """An entry"""
    type LocalEntry {
        """The types of the entry"""
        types: [String!]!
        """The source of the entry"""
        source: String!
        """The owner of the entry"""
        owner: String!
        """The id of the entry"""
        id: String!
        """The revision of the entry"""
        revision: String!
        """The language of the entry"""
        language: String!
        """The title of the entry"""
        title: String!
        """The abbreviation of the entry"""
        abbreviation: String!
        """The copyright of the entry"""
        copyright: String!
        """The text direction of the entry"""
        textDirection: String!
        """A named stat, if it exists"""
        stat(
            """The name of the stat field"""
            field: String!
        ): Int
        """A named resource stat, if the resource and the stat exist"""
        resourceStat(
            """The bookCode of the resource"""
            bookCode: String!
            """The name of the stat field"""
            field: String!
        ): Int
        """A named resource stat for each resource"""
        resourcesStat(
            """The name of the stat field"""
            field: String!
        ): [ResourceStat!]
        """Canon-level resources for the entry"""
        canonResources: [CanonResource!]!
        """Canon-level resource of a given type for the entry, if it exists"""
        canonResource(
            """The resource type"""
            type: String!
        ): CanonResource
        """Book-level resources"""
        bookResources(
          """The bookCode"""
          bookCode: String!
        ): [BookResource!]!
        """Book-level resource of a given type for the entry, if it exists"""
        bookResource(
          """The bookCode"""
          bookCode: String!
          """The resource type"""
          type: String!
        ): BookResource
        """Book codes for book-level resources, optionally filtered by type"""
        bookCodes(
            """The resource type"""
            type: String
        ) : [String!]!
        """Resource types that exist for this book"""
        bookResourceTypes: [String!]!
    }
    
    """A resource stat"""
    type ResourceStat {
        """The bookCode"""
        bookCode: String!
        """The stat"""
        stat: Int
    }
    
    """Canon-level Resource"""
    type CanonResource {
        """The resource type"""
        type: String!
        """The resource content"""
        content: String!
        """The resource file suffix"""
        suffix: String!
        """Is the resource original?"""
        isOriginal: Boolean!
    }        

    """Book-level Resource"""
    type BookResource {
        """The resource type"""
        type: String!
        """The resource content"""
        content: String!
        """The resource file suffix"""
        suffix: String!
        """Is the resource original?"""
        isOriginal: Boolean!
    }        

    """An organization from which this server can serve data"""
    type Org {
        """A short name for the organization"""
        name: OrgName!
        """A full name for the organization"""
        fullName: String!
        """The content type received from this organization"""
        contentType: ContentType!
        """The number of catalog entries for this organization"""
        nCatalogEntries: Int!
        """The number of local entries for this organization"""
        nLocalEntries(
            """Only count entries with local USFM"""
            withUsfm: Boolean
            """Only count entries with local USX"""
            withUsx: Boolean
        )
        : Int!
        """The catalog entries that are available from this organization"""
        catalogEntries(
            """The ids of the catalogEntries"""
            withId: [EntryId!]
            """Filter according to presence or absence of USFM"""
            withUsfm: Boolean
            """Filter according to presence or absence of USX"""
            withUsx: Boolean
            """Filter by language codes"""
            withLanguageCode: [String!]
            """Filter by text matches in title"""
            withMatchingMetadata: [String!]
            """Sort field"""
            sortedBy: String
            """Sort in reverse order"""
            reverse: Boolean
        ): [CatalogEntry!]!
        """Catalog entry of this organization with the given id, if found"""
        catalogEntry(
            """The id of the catalog entry"""
            id: EntryId!
        ): CatalogEntry
        """The entries that are available locally from this organization"""
        localEntries(
            """The ids of the entries"""
            withId: [EntryId!]
            """Filter according to presence or absence of USFM"""
            withUsfm: Boolean
            """Filter according to presence or absence of USX"""
            withUsx: Boolean
            """Filter according to presence or absence of succinct JSON"""
            withSuccinct: Boolean
            """Filter according to presence or absence of succinct generation error"""
            withSuccinctError: Boolean
            """Filter by owners"""
            withOwner: [String!]
            """Filter by language codes"""
            withLanguageCode: [String!]
            """Filter by text matches in title"""
            withMatchingMetadata: [String!]
            """Filter by set features"""
            withFeatures: [String!]
            """Sort by id, languageCode or title"""
            sortedBy: String
            """Sort in reverse order"""
            reverse: Boolean
        ): [Entry!]!
        """Entry of this organization with the given id, if found locally"""
        localEntry(
            """The id of the entry"""
            id: EntryId!
            """The revision of the entry"""
            revision: String!
        ): Entry
    }
    """A Catalog Entry"""
    type CatalogEntry {
        """An id for the entry which is unique within the organization"""
        id: EntryId!
        """The revision of the entry"""
        revision: String!
        """The language code"""
        languageCode: String!
        """The owner"""
        owner: String!
        """a title of the entry"""
        title: String!
        """is this org/id local?"""
        isLocal: Boolean!
    }
    """A Local Entry"""
    type Entry {
        """A list of resource types for this entry"""
        resourceTypes: [String!]!
        """An id for the entry which is unique within the organization"""
        id: EntryId!
        """The revision of the entry"""
        revision: String!
        """The language code"""
        languageCode: String!
        """The owner"""
        owner: String!
        """a title of the entry"""
        title: String!
        """The direction of the text"""
        textDirection: String
        """The script for the language"""
        script: String
        """A copyright message"""
        copyright: String!
        """An abbreviation"""
        abbreviation: String!
        """The number of Scripture books as USFM in this entry"""
        nUsfmBooks: Int
        """The bookCodes of Scripture books as USFM in this entry"""
        usfmBookCodes: [BookCode!]
        """Whether or not USFM for this bookCode is present for this entry"""
        hasUsfmBookCode(
            """The bookCode (3-char upper-case Paratext format)"""
            code: BookCode!
        ): Boolean
        """Is USFM available?"""
        hasUsfm: Boolean!
        """The USFM for this entry"""
        usfmForBookCode(
            """The bookCode"""
            code: BookCode!
        ): String
        nUsxBooks: Int
        """The bookCodes of Scripture books as USX in this entry"""
        usxBookCodes: [BookCode!]
        """Whether or not USX for this bookCode is present for this entry"""
        hasUsxBookCode(
            """The bookCode (3-char upper-case Paratext format)"""
            code: BookCode!
        ): Boolean
        """Is USX available?"""
        hasUsx: Boolean!
        """The USX for this entry"""
        usxForBookCode(
            """The bookCode"""
            code: BookCode!
        ): String
        """Is PERF available?"""
        hasPerf: Boolean!
        """The PERF for this entry"""
        perfForBookCode(
            """The bookCode"""
            code: BookCode!
        ): String
        """Is simplePERF available?"""
        hasSimplePerf: Boolean!
        """The simplePERF for this entry"""
        simplePerfForBookCode(
            """The bookCode"""
            code: BookCode!
        ): String
        """Is SOFRIA available?"""
        hasSofria: Boolean!
        """The SOFRIA for this entry"""
        sofriaForBookCode(
            """The bookCode"""
            code: BookCode!
        ): String
        """Is Proskomma succinct docSet available?"""
        hasSuccinct: Boolean!
        """The Proskomma succinct docSet for this entry"""
        succinct: String
        """Is there a succinct Json error?"""
        hasSuccinctError: Boolean!
        """The succinct Json error for this entry"""
        succinctError: String
        """Is VRS file available?"""
        hasVrs: Boolean!
        """The VRS file for this entry"""
        vrs: String
        """The number of OT books in this document"""
        nOT: Int!
        """The number of NT books in this document"""
        nNT: Int!
        """The number of DC books in this document"""
        nDC: Int!
        """The number of introductions in this document"""
        nIntroductions: Int!
        """The number of xrefs in this document"""
        nXrefs: Int!
        """The number of footnotes in this document"""
        nFootnotes: Int!
        """The number of headings in this document"""
        nHeadings: Int!
        """The number of strong markup in this document"""
        nStrong: Int!
        """The number of lemma markup in this document"""
        nLemma: Int!
        """The number of gloss markup in this document"""
        nGloss: Int!
        """The number of content markup in this document"""
        nContent: Int!
        """The number of occurrences markup in this document"""
        nOccurrences: Int!
        """The number of chapters in this document"""
        nChapters: Int!
        """The number of verses in this document"""
        nVerses: Int!
    }
    `;
const mutationSchema = gql`
    type Mutation {
        """Fetches and processes the specified USFM content from a remote server"""
        fetchUsfm(
            """The name of the organization"""
            org: OrgName!
            """The id of the entry"""
            entryId: EntryId!
        ) : Boolean!
        deleteLocalEntry (
            """The name of the organization"""
            org: OrgName!
            id: EntryId!
            """The revision of the entry"""
            revision: String!
        ) : Boolean!
        """Fetches and processes the specified USX content from a remote server"""
        fetchUsx(
            """The name of the organization"""
            org: OrgName!
            """The id of the entry"""
            entryId: EntryId!
        ) : Boolean!
        """Deletes a succinct error, if present, which will allow succinct generation by the cron"""
        deleteSuccinctError(
            """The name of the organization"""
            org: OrgName!
            """The id of the entry"""
            id: EntryId!
            """The revision of the entry"""
            revision: String!
        ) : Boolean!
    }
`;

module.exports = {scalarSchema, querySchema, mutationSchema };
