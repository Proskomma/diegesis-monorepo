const { GraphQLScalarType, Kind, GraphQLError } = require("graphql");
const {
    entryExists,
    entryRevisionExists,
    entryHas,
    entryHasSuccinctError,
    entryIsLocked,
    readEntryMetadata,
    orgEntries,
    entryResources,
    entryBookResourcesForBook,
    entryBookResourceBookCodes,
    entryBookResourceBookCodesForCategory,
    entryBookResourceCategories,
    lockEntry,
    writeEntryMetadata,
    unlockEntry,
    deleteEntry,
    deleteSuccinctError,
    initializeEmptyEntry,
    initializeEntryBookResourceCategory,
    writeEntryBookResource,
    writeEntryResource,
    writeFlexibleUIConfig,
    readFlexibleUIConfig,
    writeStaticPageConfig,
    removeStaticPage
} = require("../../lib/dataLayers/fs");

const UUID = require("pure-uuid");
const btoa = require("btoa");
const serverClientStructure = require("../../lib/makeServerHelpers/serverClientStructure");

const generateId = () => btoa(new UUID(4)).substring(0, 12);

const makeResolvers = async (orgsData, orgHandlers, config) => {
    const scalarRegexes = {
        OrgName: new RegExp(/^[A-Za-z0-9][A-Za-z0-9_]{0,62}[A-Za-z0-9]$/),
        EntryId: new RegExp(/^[A-Za-z0-9_-]{1,64}$/),
        BookCode: new RegExp(/^[A-Z0-9]{3}$|^tyndaleStudyNotes$/),
        ContentType: new RegExp(/^(USFM|USX|succinct|tyndaleStudyNotes)$/),
        scriptRegex: /^[A-Za-z0-9]{1,16}$/,
        abbreviationRegex: /^[A-Za-z][A-Za-z0-9]+$/,
    };

    const orgNameScalar = new GraphQLScalarType({
        name: "OrgName",
        description: "Name of a data source",
        serialize(value) {
            if (typeof value !== "string") {
                return null;
            }
            if (!scalarRegexes.OrgName.test(value)) {
                return null;
            }
            return value;
        },
        parseValue(value) {
            return value;
        },
        parseLiteral(ast) {
            if (ast.kind !== Kind.STRING) {
                throw new Error(`Must be a string, not ${ast.kind}`);
            }
            if (!scalarRegexes.OrgName.test(ast.value)) {
                throw new Error(`One or more characters is not allowed`);
            }
            return ast.value;
        },
    });

    const ContentTypeScalar = new GraphQLScalarType({
        name: "ContentType",
        description: "The type of content returned by an organization",
        serialize(value) {
            if (typeof value !== "string") {
                return null;
            }
            if (!scalarRegexes.ContentType.test(value)) {
                return null;
            }
            return value;
        },
        parseValue(value) {
            return value;
        },
        parseLiteral(ast) {
            if (ast.kind !== Kind.STRING) {
                throw new Error(`Must be a string, not ${ast.kind}`);
            }
            if (!scalarRegexes.ContentType.test(ast.value)) {
                throw new Error(`Expected USFM, USX, succinct or TSV`);
            }
            return ast.value;
        },
    });

    const entryIdScalar = new GraphQLScalarType({
        name: "EntryId",
        description: "Identifier for an entry",
        serialize(value) {
            if (typeof value !== "string") {
                return null;
            }
            if (!scalarRegexes.EntryId.test(value)) {
                return null;
            }
            return value;
        },
        parseValue(value) {
            return value;
        },
        parseLiteral(ast) {
            if (ast.kind !== Kind.STRING) {
                throw new Error(`Must be a string, not ${ast.kind}`);
            }
            if (!scalarRegexes.EntryId.test(ast.value)) {
                throw new Error(`One or more characters is not allowed`);
            }
            return ast.value;
        },
    });

    const bookCodeScalar = new GraphQLScalarType({
        name: "BookCode",
        description: "Paratext-like code for a Scripture book",
        serialize(value) {
            if (typeof value !== "string") {
                return null;
            }
            if (!scalarRegexes.BookCode.test(value)) {
                return null;
            }
            return value;
        },
        parseValue(value) {
            return value;
        },
        parseLiteral(ast) {
            if (ast.kind !== Kind.STRING) {
                throw new Error(`Must be a string, not ${ast.kind}`);
            }
            if (!scalarRegexes.BookCode.test(ast.value)) {
                throw new Error(`One or more characters is not allowed`);
            }
            return ast.value;
        },
    });

    const jsonScaler = new GraphQLScalarType({
        name: 'JSON',
        description: 'Parse json',
        serialize(value) {
            return value;
        },
        parseValue(value) {
            return value;
        },
        parseLiteral(ast) {
            return ast.value;
        }
    });

    const entryInColorList = (colorList, entry) => {
        for (const colorItem of colorList) {
            if (colorItem.id === entry.id) {
                return true;
            }
        }
        return false;
    };

    const entryCanSync = (org, entry) => {
        if (
            org.catalogHasRevisions &&
            entryRevisionExists(
                config,
                org.name,
                entry.id,
                entry.revision
            )
        ) {
            return false;
        } else if (entryExists(config, org.name, entry.id)) {
            return false;
        }
        if (org.config) {
            if (
                org.config.blacklist &&
                entryInColorList(org.config.blacklist, entry)
            ) {
                return false;
            }
            if (
                org.config.whitelist &&
                entryInColorList(org.config.whitelist, entry)
            ) {
                return true;
            }
            if (
                org.config.languages &&
                (org.config.languages.length > 0) &&
                !org.config.languages.includes(entry.languageCode.split("-")[0])
            ) {
                return false;
            }
        }
        return true;
    };

    const filteredCatalog = (org, args, context, entries) => {
        context.orgData = org;
        context.orgHandler = orgHandlers[org.name];
        let ret = [...entries];
        if (args.withId) {
            ret = ret.filter((t) => args.withId.includes(t.id));
        }
        if (args.syncOnly) {
            ret = ret.filter((e) => entryCanSync(orgsData[e.source], e));
        }
        if (args.withOwner) {
            ret = ret.filter(
                (t) =>
                    args.withOwner.filter((ow) =>
                        t.owner.toLowerCase().includes(ow.toLowerCase())
                    ).length > 0
            );
        }
        if (args.withLanguageCode) {
            ret = ret.filter((t) => args.withLanguageCode.includes(t.languageCode));
        }
        if (args.withMatchingMetadata) {
            ret = ret.filter(
                (t) =>
                    args.withMatchingMetadata.filter((md) =>
                        t.title.toLowerCase().includes(md.toLowerCase())
                    ).length > 0
            );
        }
        if ("withUsfm" in args) {
            const filterFunc = (e) =>
                entryHas(config, context.orgData.name, e.id, e.revision, "usfmBooks");
            if (args.withUsfm) {
                ret = ret.filter((t) => filterFunc(t));
            } else {
                ret = ret.filter((t) => !filterFunc(t));
            }
        }
        if ("withUsx" in args) {
            const filterFunc = (e) =>
                entryHas(config, context.orgData.name, e.id, e.revision, "usxBooks");
            if (args.withUsx) {
                ret = ret.filter((t) => filterFunc(t));
            } else {
                ret = ret.filter((t) => !filterFunc(t));
            }
        }
        if ("withSuccinct" in args) {
            const filterFunc = (e) =>
                entryHas(
                    config,
                    context.orgData.name,
                    e.id,
                    e.revision,
                    "succinct.json"
                );
            if (args.withSuccinct) {
                ret = ret.filter((t) => filterFunc(t));
            } else {
                ret = ret.filter((t) => !filterFunc(t));
            }
        }
        if ("withSuccinctError" in args) {
            const filterFunc = (e) =>
                entryHasSuccinctError(config, context.orgData.name, e.id, e.revision);
            if (args.withSuccinctError) {
                ret = ret.filter((t) => filterFunc(t));
            } else {
                ret = ret.filter((t) => !filterFunc(t));
            }
        }
        if (args.sortedBy) {
            if (!["id", "languageCode", "owner", "title"].includes(args.sortedBy)) {
                throw new Error(`Invalid sortedBy option '${args.sortedBy}'`);
            }
            ret.sort(function (a, b) {
                const lca = a[args.sortedBy].toLowerCase();
                const lcb = b[args.sortedBy].toLowerCase();
                return lca.localeCompare(lcb);
            });
        }
        if (args.reverse) {
            ret.reverse();
        }
        return ret;
    };

    const localEntry = (org, entryId, revision) => {
        if (!entryIsLocked(config, org, entryId, revision)) {
            return readEntryMetadata(config, org, entryId, revision);
        }
        return null;
    };

    const checkCreateLocalEntryFields = (metadataArgs, resources) => {
        const fields = [
            "title",
            "description",
            "langCode",
            "script",
            "copyright",
            "abbreviation",
            "textDirection",
        ];
        if (metadataArgs.length !== fields.length) {
            return `Wrong number of metadata args (expected ${fields.join(', ')})`;
        }
        const argsFields = metadataArgs.map((a) => a.key);
        const unexpected = argsFields.filter((f) => !fields.includes(f));
        if (unexpected.length !== 0) {
            return `Unexpected metadata fields ${unexpected.join(";")}`;
        }
        const missing = fields.filter((f) => !argsFields.includes(f));
        if (missing.length !== 0) {
            return `Missing metadata fields ${missing.join(";")}`;
        }
        for (const arg of metadataArgs) {
            if (arg.key === "langCode") {
                if (arg.value === "pleaseChoose") {
                    return `please provide a value for the ${arg.key} field`;
                }
            } else {
                if (arg.value.length === 0) {
                    return `please provide a value for the ${arg.key} field`;
                }
            }
            switch (arg.key) {
                case "title":
                    if (arg.value.length < 6 || arg.value.length > 64) {
                        return `The ${arg.key} field must contain between 6 and 64 characters`;
                    }
                    break;
                case "description":
                    if (arg.value.length < 6 || arg.value.length > 255) {
                        return `The ${arg.key} field must contain between 6 and 255 characters`;
                    }
                    break;
                case "script":
                    if (!scalarRegexes.scriptRegex.test(arg.value)) {
                        return `The field ${arg.key} must match the regular expression ${scalarRegexes.scriptRegex}`;
                    }
                    break;
                case "copyright":
                    if (arg.value.length < 6 || arg.value.length > 64) {
                        return `The ${arg.key} field must contain between 6 and 255 characters`;
                    }
                    break;
                case "abbreviation":
                    if (!scalarRegexes.abbreviationRegex.test(arg.value)) {
                        return `The field ${arg.key} must match the regular expression ${scalarRegexes.abbreviationRegex}`;
                        // break;
                    }
            }
        }
        if (resources.length === 0) {
            return `At least one resource upload must be provided`;
        }
        return "";
    }

    const scalarResolvers = {
        OrgName: orgNameScalar,
        EntryId: entryIdScalar,
        BookCode: bookCodeScalar,
        ContentType: ContentTypeScalar,
        JSON: jsonScaler,
    };

    const lowerCaseArray = (arr) => arr.map((e) => e.trim().toLocaleLowerCase());

    const queryResolver = {
        Query: {
            name: () => config.name,
            orgs: () => {
                return Object.values(orgsData);
            },
            org: (root, args, context) => {
                context.incidentLogger = config.incidentLogger;
                return orgsData[args.name];
            },
            clientStructure: (root, args, context) => {
                return context.clientStructure;
            },
            entryEnums: root => {
                const enums = {
                    languages: new Set([]),
                    types: new Set([]),
                    sources: new Set([]),
                    owners: new Set([])
                };
                for (const orgSource of Object.keys(orgsData)) {
                    for (const entryRecord of orgEntries(config, orgSource)) {
                        for (const revision of entryRecord.revisions) {
                            const revisionRecord = readEntryMetadata(config, orgSource, entryRecord.id, revision);
                            enums.languages.add(revisionRecord.languageCode);
                            enums.sources.add(revisionRecord.source);
                            enums.owners.add(revisionRecord.owner);
                            for (const resourceType of revisionRecord.resourceTypes) {
                                enums.types.add(resourceType);
                            }
                        }
                    }
                }
                return {
                    languages: Array.from(enums.languages),
                    types: Array.from(enums.types),
                    sources: Array.from(enums.sources),
                    owners: Array.from(enums.owners)
                };
            },
            localEntries: (root, args) => {
                let ret = [];
                for (const org of Object.keys(orgsData)) {
                    for (const entry of orgEntries(config, org)) {
                        for (const revision of entry.revisions) {
                            ret.push(readEntryMetadata(config, org, entry.id, revision));
                        }
                    }
                }
                ret = ret
                    .filter(
                        (e) =>
                            !args.sources ||
                            lowerCaseArray(args.sources).includes(
                                e.source.toLocaleLowerCase()
                            )
                    )
                    .filter(
                        (e) =>
                            !args.owners ||
                            lowerCaseArray(args.owners).includes(e.owner.toLocaleLowerCase())
                    )
                    .filter(
                        (e) =>
                            !args.ids ||
                            lowerCaseArray(args.ids).includes(e.id.toLocaleLowerCase())
                    )
                    .filter(
                        (e) =>
                            !args.languages ||
                            lowerCaseArray(args.languages).includes(
                                e.languageCode.toLocaleLowerCase()
                            )
                    )
                    .filter(
                        (e) =>
                            !args.titleMatching ||
                            e.title
                                .toLocaleLowerCase()
                                .includes(args.titleMatching.toLocaleLowerCase())
                    )
                    .filter(
                        (e) =>
                            !args.types ||
                            args.types.filter((t) =>
                                e.resourceTypes.includes(t)
                            ).length > 0
                    )
                    .filter(
                        (e) =>
                            !args.withStatsFeatures ||
                            (e.stats &&
                                args.withStatsFeatures.filter((f) => {
                                    const key = `n${f[0].toLocaleUpperCase()}${f.substring(1)}`;
                                    return key in e.stats && e.stats[key] > 0;
                                }).length === args.withStatsFeatures.length)
                    );
                ret = [...ret].sort((a, b) =>
                    a[args.sortedBy || "title"]
                        .toLowerCase()
                        .localeCompare(b[args.sortedBy || "title"].toLowerCase())
                );
                if (args.reverse) {
                    ret = [...ret].reverse();
                }
                return ret;
            },
            localEntry: (root, args) => {
                return localEntry(orgsData[args.source].name, args.id, args.revision);
            },
            flexibleUIConfig: (root, args) => {
                return readFlexibleUIConfig(config, args.id);
            },
        },
        LocalEntry: {
            transId: (root) => root.id,
            types: (root) => root.resourceTypes,
            language: (root) => root.languageCode,
            stat: (root, args) => {
                const stats = root.stats;
                if (!stats || typeof stats[args.field] !== "number") {
                    return null;
                }
                return stats[args.field];
            },
            stats: (root) => {
                let ret = [];
                if (root.stats) {
                    for (const [field, stat] of Object.entries(root.stats)) {
                        if (field === "documents") {
                            continue;
                        }
                        ret.push({ field, stat });
                    }
                }
                return ret;
            },
            resourceStat: (root, args) => {
                const stats = root.stats;
                if (
                    !stats ||
                    !stats.documents ||
                    !stats.documents[args.bookCode] ||
                    typeof stats.documents[args.bookCode][args.field] !== "number"
                ) {
                    return null;
                }
                return stats.documents[args.bookCode][args.field];
            },
            resourcesStat: (root, args) => {
                const stats = root.stats;
                if (!stats) {
                    return null;
                }
                const documentStats = stats.documents;
                if (!documentStats) {
                    return null;
                }
                return Object.entries(documentStats).map((kv) => ({
                    bookCode: kv[0],
                    field: args.field,
                    stat:
                        typeof kv[1][args.field] === "number" ? kv[1][args.field] : null,
                }));
            },
            bookStats: (root, args) => {
                let ret = [];
                if (
                    root.stats &&
                    root.stats.documents &&
                    root.stats.documents[args.bookCode]
                ) {
                    const bookCodeStats = root.stats.documents[args.bookCode];
                    for (const [field, stat] of Object.entries(bookCodeStats)) {
                        ret.push({ bookCode: args.bookCode, field, stat });
                    }
                }
                return ret;
            },
            canonResources: (root) => {
                return entryResources(
                    config,
                    orgsData[root.source].name,
                    root.id,
                    root.revision
                );
            },
            canonResource: (root, args) => {
                const matchingResources = entryResources(
                    config,
                    orgsData[root.source].name,
                    root.id,
                    root.revision
                ).filter((r) => r.type === args.type);
                if (matchingResources.length === 0) {
                    return null;
                }
                return matchingResources[0];
            },
            bookResources: (root, args) => {
                return entryBookResourcesForBook(
                    config,
                    orgsData[root.source].name,
                    root.id,
                    root.revision,
                    args.bookCode
                );
            },
            bookResource: (root, args) => {
                const resources = entryBookResourcesForBook(
                    config,
                    orgsData[root.source].name,
                    root.id,
                    root.revision,
                    args.bookCode
                );
                const matchingResources = resources.filter((r) => r.type === args.type);
                if (matchingResources.length === 0) {
                    return null;
                }
                return matchingResources[0];
            },
            bookCodes: (root, args) => {
                if (args.type) {
                    return entryBookResourceBookCodesForCategory(
                        config,
                        orgsData[root.source].name,
                        root.id,
                        root.revision,
                        args.type
                    );
                } else {
                    return entryBookResourceBookCodes(
                        config,
                        orgsData[root.source].name,
                        root.id,
                        root.revision
                    );
                }
            },
            bookResourceTypes: (root) => {
                return entryBookResourceCategories(
                    config,
                    orgsData[root.source].name,
                    root.id,
                    root.revision
                );
            },
            hasSuccinctError: (root) => {
                return false;
            },
            hasLock: (root) => {
                return false;
            },
        },
        Org: {
            catalogEntries: (org, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for catalogEntries`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(
                        `Required auth role 'admin' not found for catalogEntries`
                    );
                }
                return filteredCatalog(org, args, context, org.entries);
            },
            catalogEntry: (org, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for catalogEntry`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(
                        `Required auth role 'admin' not found for catalogEntry`
                    );
                }
                context.orgData = org;
                context.orgHandler = orgHandlers[org.name];
                return org.entries.filter((t) => t.id === args.id)[0];
            },
        },
        CatalogEntry: {
            transId: (root) => root.id,
            isLocal: (root, args, context) =>
                entryExists(config, orgsData[root.source].name, root.id),
            isRevisionLocal: (root, args, context) =>
                context.orgData.catalogHasRevisions
                    ? entryRevisionExists(
                        config,
                        orgsData[root.source].name,
                        root.id,
                        root.revision
                    )
                    : null,
        },
        CanonResource: {
            content: (root) => {
                if (!root.content) {
                    // shouldn't happen
                    return null;
                }
                if (typeof root.content === "object") {
                    return JSON.stringify(root.content);
                } else {
                    return root.content;
                }
            },
        },
        BookResource: {
            content: (root) => {
                if (!root.content) {
                    // shouldn't happen
                    return null;
                }
                if (typeof root.content === "object") {
                    return JSON.stringify(root.content);
                } else {
                    return root.content;
                }
            },
        },
        ClientStructure: {
            languages: root => Object.keys(root.languages),
            urls: root => ["home", ...root.urls, "list"],
            urlData: (root, args) => ["home", ...root.urls, "list"].map(
                url => {
                    return {
                        url,
                        menuText: root.languages[args.language].pages[url].menuText.trim()
                    }
                }),
            metadata: (root, args) => root.languages[args.language],
            footer: (root, args) => root.languages[args.language].footer,
            page: (root, args) => root.languages[args.language].pages[args.url],
        },
        StructureResource: {
            menuText: root => root.menuText.trim(),
        }
    };
    const mutationResolver = {
        Mutation: {
            fetchUsfm: async (root, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for fetchUsfm mutation`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(`Required auth role 'admin' not found for fetchUsfm`);
                }
                const orgOb = orgsData[args.org];
                if (!orgOb) {
                    return false;
                }
                const transOb = orgOb.entries.filter((t) => t.id === args.entryId)[0];
                if (!transOb) {
                    return false;
                }
                try {
                    await orgHandlers[args.org].fetchUsfm(orgOb, transOb, config); // Adds owner and revision to transOb
                    return true;
                } catch (err) {
                    console.log(err);
                    return false;
                }
            },
            fetchUsx: async (root, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for fetchUsx mutation`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(`Required auth role 'admin' not found for fetchUsx`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(`Required auth role 'admin' not found for fetchUsx`);
                }
                const orgOb = orgsData[args.org];
                if (!orgOb) {
                    return false;
                }
                const transOb = orgOb.entries.filter((t) => t.id === args.entryId)[0];
                if (!transOb) {
                    return false;
                }
                try {
                    await orgHandlers[args.org].fetchUsx(orgOb, transOb, config); // Adds owner and revision to transOb
                    return true;
                } catch (err) {
                    console.log(err);
                    return false;
                }
            },
            fetchSuccinct: async (root, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for fetchSuccinct mutation`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(
                        `Required auth role 'admin' not found for fetchSuccinct`
                    );
                }
                const orgOb = orgsData[args.org];
                if (!orgOb) {
                    return false;
                }
                const entryOrgOb = orgsData[args.entryOrg];
                if (!entryOrgOb) {
                    return false;
                }
                const transOb = orgOb.entries.filter((t) => t.id === args.entryId)[0];
                if (!transOb) {
                    return false;
                }
                try {
                    await orgHandlers[args.org].fetchSuccinct(
                        orgOb,
                        entryOrgOb,
                        transOb,
                        config
                    ); // Adds owner and revision to transOb
                    return true;
                } catch (err) {
                    console.log(err);
                    return false;
                }
            },
            deleteLocalEntry: async (root, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for deleteLocalEntry mutation`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(
                        `Required auth role 'admin' not found for deleteLocalEntry`
                    );
                }
                const orgOb = orgsData[args.org];
                if (!orgOb) {
                    return false;
                }
                try {
                    if (entryExists(config, orgOb.name, args.id)) {
                        deleteEntry(config, orgOb.name, args.id, args.revision)
                        return true;
                    }
                    return false;
                } catch (err) {
                    console.log(err);
                    return false;
                }
            },
            deleteSuccinctError: async (root, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for deleteSuccinctError mutation`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(
                        `Required auth role 'admin' not found for deleteSuccinctError`
                    );
                }
                const orgOb = orgsData[args.org];
                if (!orgOb) {
                    return false;
                }
                const transOb = orgOb.entries.filter((t) => t.id === args.entryId)[0];
                if (!transOb) {
                    return false;
                }
                if (entryExists(config, orgOb.name, transOb.id)) {
                    deleteSuccinctError(config, orgOb.name, transOb.id, transOb.revision)
                    return true;
                } else {
                    return false;
                }
            },
            createLocalEntry: async (root, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for createLocalEntry mutation`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("archivist")) {
                    throw new Error(
                        `Required auth role 'archivist' not found for createLocalEntry`
                    );
                }
                const resourceTypes = {
                    scriptureUsfm: {
                        resourceTypes: ["bible"],
                        originalDir: "usfmBooks",
                        suffix: "usfm"
                    },
                    uwNotes: {
                        resourceTypes: ["bcvNotes"],
                        originalDir: "uwNotesBooks",
                        "suffix": "tsv"
                    },
                    tyndaleStudyNotes: {
                        resourceTypes: ["bcvNotes"],
                        originalDir: "tyndaleStudyNotesBooks",
                        "suffix": "tsv"
                    }
                }
                if (!resourceTypes[args.contentType]) {
                    throw new Error(`Content type '${args.contentType}' not supported`);
                }
                const fieldError = checkCreateLocalEntryFields(args.metadata, args.resources);
                if (fieldError.length > 0) {
                    throw new Error(fieldError);
                }
                try {
                    const metadataMap = {};
                    for (const ob of args.metadata) {
                        metadataMap[ob.key] = ob.value;
                    }
                    let id = generateId();
                    let revision = generateId();
                    const entryMetadata = {
                        source: config.name,
                        resourceTypes: resourceTypes[args.contentType].resourceTypes,
                        id: id,
                        languageCode: metadataMap["langCode"],
                        title: metadataMap["title"],
                        textDirection: metadataMap["textDirection"],
                        script: metadataMap["script"],
                        copyright: metadataMap["copyright"],
                        description: metadataMap["description"],
                        abbreviation: metadataMap["abbreviation"],
                        owner: config.name,
                        revision: revision,
                    };
                    initializeEmptyEntry(config, config.name, id, revision);
                    lockEntry(config, config.name, id, revision, "archivist/add");
                    writeEntryMetadata(config, config.name, id, revision, entryMetadata);

                    if (args.contentType === 'tyndaleStudyNotes') {
                        writeEntryResource(config, config.name, id, revision, "original", "studyNotes.tsv", args.resources[0].content);
                    } else {
                        initializeEntryBookResourceCategory(
                            config,
                            config.name,
                            id,
                            revision,
                            "original",
                            resourceTypes[args.contentType].originalDir
                        );
                        for (const resource of args.resources) {
                            writeEntryBookResource(
                                config,
                                config.name,
                                id,
                                revision,
                                resourceTypes[args.contentType].originalDir,
                                `${resource.bookCode}.${resourceTypes[args.contentType].suffix}`,
                                resource.content
                            );
                        }
                    }
                    unlockEntry(config, config.name, id, revision);
                } catch (err) {
                    deleteEntry(config, config.name, id, revision);
                    throw err;
                }
                return true;
            },
            saveFlexibleUIConfig: async (root, args, context) => {
                if (!context?.auth?.authenticated) {
                    throw new GraphQLError(`No auth found for saveFlexibleUIConfig mutation`, { extensions: { code: 401 } });
                }
                if (!context?.auth?.roles?.includes("admin")) {
                    throw new GraphQLError(`Required auth role 'admin' not found for saveFlexibleUIConfig`, { extensions: { code: 403 } });
                }
                writeFlexibleUIConfig(config, args);
                return true;
            },
            saveStaticPage: async (root, args, context) => {
                // if (!context?.auth?.authenticated) {
                //     throw new GraphQLError(`No auth found for saveStaticPage mutation`, { extensions: { code: 401 } });
                // }
                // if (!context?.auth?.roles?.includes("admin")) {
                //     throw new GraphQLError(`Required auth role 'admin' not found for saveStaticPage`, { extensions: { code: 403 } });
                // }
                await writeStaticPageConfig(config, args.config)
                Object.assign(context.clientStructure, serverClientStructure(config))
                return true;
            },
            removeStaticPage: async (root, args, context) => {
                // if (!context?.auth?.authenticated) {
                //     throw new GraphQLError(`No auth found for removeStaticPage mutation`, { extensions: { code: 401 } });
                // }
                // if (!context?.auth?.roles?.includes("admin")) {
                //     throw new GraphQLError(`Required auth role 'admin' not found for removeStaticPage`, { extensions: { code: 403 } });
                // }
                await removeStaticPage(config, args);
                Object.assign(context.clientStructure, serverClientStructure(config));
                return true;
            }
        },
    };

    if (config.includeMutations) {
        return { ...scalarResolvers, ...queryResolver, ...mutationResolver };
    } else {
        return { ...scalarResolvers, ...queryResolver };
    }
};

module.exports = makeResolvers;
