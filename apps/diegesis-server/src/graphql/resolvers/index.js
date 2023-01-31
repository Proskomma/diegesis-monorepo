const path = require('path');
const fse = require('fs-extra');
const {GraphQLScalarType, Kind} = require('graphql');
const {ptBooks} = require('proskomma-utils');
const {
    transPath,
    transParentPath,
    usfmDir,
    usxDir,
    succinctPath,
    succinctErrorPath,
    originalResourcePath,
    generatedResourcePath
} = require('../../lib/dataPaths');

const makeResolvers = async (orgsData, orgHandlers, config) => {

    const scalarRegexes = {
        OrgName: new RegExp(/^[A-Za-z0-9]{2,64}$/),
        EntryId: new RegExp(/^[A-Za-z0-9_-]{1,64}$/),
        BookCode: new RegExp(/^[A-Z0-9]{3}$/),
        ContentType: new RegExp(/^(USFM|USX)$/),
    }

    const orgNameScalar = new GraphQLScalarType({
        name: 'OrgName',
        description: 'Name of a data source',
        serialize(value) {
            if (typeof value !== 'string') {
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
            return ast.value
        },
    });

    const ContentTypeScalar = new GraphQLScalarType({
        name: 'ContentType',
        description: 'The type of content returned by an organization',
        serialize(value) {
            if (typeof value !== 'string') {
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
                throw new Error(`Expected USFM or USX`);
            }
            return ast.value
        },
    });

    const entryIdScalar = new GraphQLScalarType({
        name: 'EntryId',
        description: 'Identifier for an entry',
        serialize(value) {
            if (typeof value !== 'string') {
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
            return ast.value
        },
    });

    const bookCodeScalar = new GraphQLScalarType({
        name: 'BookCode',
        description: 'Paratext-like code for a Scripture book',
        serialize(value) {
            if (typeof value !== 'string') {
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
            return ast.value
        },
    });

    const entryInColorList = (colorList, entry) => {
        for (const colorItem of colorList) {
            if (colorItem.id === entry.id) {
                return true;
            }
        }
        return false;
    }

    const entryCanSync = (org, entry) => {
        let path;
        if (org.catalogHasRevisions) {
            path = transPath(config.dataPath, org.translationDir, entry.id, entry.revision);
        } else {
            path = transParentPath(config.dataPath, org.translationDir, entry.id);
        }
        if (fse.pathExistsSync(path)) {
            return false;
        }
        if (org.config) {
            if (org.config.blacklist && entryInColorList(org.config.blacklist, entry)) {
                return false;
            }
            if (org.config.whitelist && entryInColorList(org.config.whitelist, entry)) {
                return true;
            }
            if (org.config.languages && !org.config.languages.includes(entry.languageCode.split('-')[0])) {
                return false;
            }
        }
        return true;
    }

    const filteredCatalog = (org, args, context, entries) => {
        context.orgData = org;
        context.orgHandler = orgHandlers[org.name];
        let ret = [...entries];
        if (args.withId) {
            ret = ret.filter(t => args.withId.includes(t.id));
        }
        if (args.syncOnly) {
            ret = ret.filter(e => entryCanSync(org, e));
        }
        if (args.withOwner) {
            ret = ret.filter(
                t =>
                    args.withOwner.filter(
                        ow => t.owner.toLowerCase().includes(ow.toLowerCase())
                    ).length > 0
            )
        }
        if (args.withLanguageCode) {
            ret = ret.filter(t => args.withLanguageCode.includes(t.languageCode));
        }
        if (args.withMatchingMetadata) {
            ret = ret.filter(
                t =>
                    args.withMatchingMetadata.filter(
                        md => t.title.toLowerCase().includes(md.toLowerCase())
                    ).length > 0
            )
        }
        if ('withUsfm' in args) {
            if (args.withUsfm) {
                ret = ret.filter(t => fse.pathExistsSync(usfmDir(config.dataPath, context.orgData.translationDir, t.id, t.revision)));
            } else {
                ret = ret.filter(t => !fse.pathExistsSync(usfmDir(config.dataPath, context.orgData.translationDir, t.id, t.revision)));
            }
        }
        if ('withUsx' in args) {
            if (args.withUsx) {
                ret = ret.filter(t => fse.pathExistsSync(usxDir(config.dataPath, context.orgData.translationDir, t.id, t.revision)));
            } else {
                ret = ret.filter(t => !fse.pathExistsSync(usxDir(config.dataPath, context.orgData.translationDir, t.id, t.revision)));
            }
        }
        if ('withSuccinct' in args) {
            if (args.withSuccinct) {
                ret = ret.filter(t => fse.pathExistsSync(succinctPath(config.dataPath, context.orgData.translationDir, t.id)));
            } else {
                ret = ret.filter(t => !fse.pathExistsSync(succinctPath(config.dataPath, context.orgData.translationDir, t.id)));
            }
        }
        if ('withSuccinctError' in args) {
            if (args.withSuccinctError) {
                ret = ret.filter(t => fse.pathExistsSync(succinctErrorPath(config.dataPath, context.orgData.translationDir, t.id)));
            } else {
                ret = ret.filter(t => !fse.pathExistsSync(succinctErrorPath(config.dataPath, context.orgData.translationDir, t.id)));
            }
        }
        if (args.sortedBy) {
            if (!['id', 'languageCode', 'owner', 'title'].includes(args.sortedBy)) {
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
    }

    const localEntry = (org, entryId, revision) => {
        const translationPath = transPath(config.dataPath, org, entryId, revision);
        if (fse.pathExistsSync(translationPath)) {
            return fse.readJsonSync(path.join(translationPath, "metadata.json"));
        } else {
            return null;
        }
    }

    const scalarResolvers = {
        OrgName: orgNameScalar,
        EntryId: entryIdScalar,
        BookCode: bookCodeScalar,
        ContentType: ContentTypeScalar,
    }

    const lowerCaseArray = arr => arr.map(e => e.trim().toLocaleLowerCase());

    const queryResolver = {
        Query: {
            orgs: () => {
                return Object.values(orgsData);
            },
            org: (root, args, context) => {
                context.incidentLogger = config.incidentLogger;
                return orgsData[args.name];
            },
            localEntries: (root, args) => {
                let ret = [];
                for (const source of fse.readdirSync(config.dataPath)) {
                    const sourcePath = path.join(config.dataPath, source);
                    if (!fse.lstatSync(sourcePath).isDirectory()) {
                        continue;
                    }
                    for (const transId of fse.readdirSync(sourcePath)) {
                        const idPath = path.join(sourcePath, transId);
                        if (!fse.lstatSync(idPath).isDirectory()) {
                            continue;
                        }
                        for (const revision of fse.readdirSync(idPath)) {
                            const metadataPath = path.join(idPath, revision, "metadata.json");
                            ret.push(fse.readJsonSync(metadataPath));
                        }
                    }
                }
                ret = ret.filter(e =>
                    !args.sources ||
                    lowerCaseArray(args.sources).includes(e.source.toLocaleLowerCase()))
                    .filter(e =>
                        !args.owners ||
                        lowerCaseArray(args.owners).includes(e.owner.toLocaleLowerCase()))
                    .filter(e =>
                        !args.ids ||
                        lowerCaseArray(args.ids).includes(e.id.toLocaleLowerCase()))
                    .filter(e =>
                        !args.languages ||
                        lowerCaseArray(args.languages).includes(e.languageCode.toLocaleLowerCase()))
                    .filter(e =>
                        !args.titleMatching ||
                        e.title.toLocaleLowerCase()
                            .includes(args.titleMatching.toLocaleLowerCase()))
                    .filter(e =>
                        !args.types ||
                        lowerCaseArray(args.types)
                            .filter(t => e.resourceTypes.includes(t))
                            .length > 0
                    )
                    .filter(e =>
                        !args.withStatsFeatures ||
                        (
                            e.stats &&
                            (args.withStatsFeatures
                                .filter(f => {
                                    const key = `n${f[0].toLocaleUpperCase()}${f.substring(1)}`;
                                    return (key in e.stats && e.stats[key] > 0);
                                })
                                .length === args.withStatsFeatures.length)
                        )
                    );
                ret = [...ret].sort(
                        (a, b) =>
                            a[args.sortedBy || 'title'].toLowerCase().localeCompare(b[args.sortedBy || 'title'].toLowerCase())
                    );
                if (args.reverse) {
                    ret = [...ret].reverse();
                }
                return ret;
            },
            localEntry: (root, args) => {
                return localEntry(
                    orgsData[args.source].translationDir,
                    args.id,
                    args.revision
                );
            }
        },
        LocalEntry: {
            transId: root => root.id,
            types: root => root.resourceTypes,
            language: root => root.languageCode,
            stat: (root, args) => {
                const stats = root.stats;
                if (!stats || typeof stats[args.field] !== 'number') {
                    return null;
                }
                return stats[args.field];
            },
            stats: (root) => {
                let ret = []
                if (root.stats) {
                    for (const [field, stat] of Object.entries(root.stats)) {
                        if (field === "documents") {
                            continue
                        }
                        ret.push({field, stat})
                    }
                }
                return ret;
            },
            resourceStat: (root, args) => {
                const stats = root.stats;
                if (!stats || !stats.documents || !stats.documents[args.bookCode] || typeof stats.documents[args.bookCode][args.field] !== 'number') {
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
                return Object.entries(documentStats).map(kv => ({
                    bookCode: kv[0],
                    field: args.field,
                    stat: typeof kv[1][args.field] === "number" ? kv[1][args.field] : null
                }));
            },
            bookStats: (root, args) => {
                let ret = []
                if (root.stats && root.stats.documents && root.stats.documents[args.bookCode]) {
                    const bookCodeStats = root.stats.documents[args.bookCode]
                    for (const [field, stat] of Object.entries(bookCodeStats)) {
                        ret.push({bookCode: args.bookCode, field, stat})
                    }
                }
                return ret;
            },
            canonResources: root => {
                let ret = [];
                const searchPaths = [
                    ['original', originalResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                    ['generated', generatedResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                ];
                for (const [searchName, searchPath] of searchPaths) {
                    if (!fse.existsSync(searchPath)) {
                        continue;
                    }
                    for (const resource of fse.readdirSync(searchPath)) {
                        const resourcePath = path.join(searchPath, resource);
                        if (fse.lstatSync(resourcePath).isDirectory()) {
                            continue;
                        }
                        ret.push({
                            type: resource.split('.')[0],
                            isOriginal: searchName === 'original',
                            content: fse.readFileSync(resourcePath).toString(),
                            suffix: resource.split('.')[1]
                        })
                    }
                }
                return ret;
            },
            canonResource: (root, args) => {
                const searchPaths = [
                    ['original', originalResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                    ['generated', generatedResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                ];
                for (const [searchName, searchPath] of searchPaths) {
                    if (!fse.existsSync(searchPath)) {
                        continue;
                    }
                    for (const resource of fse.readdirSync(searchPath)) {
                        const resourcePath = path.join(searchPath, resource);
                        if (fse.lstatSync(resourcePath).isDirectory()) {
                            continue;
                        }
                        if (resource.split('.')[0] === args.type) {
                            return {
                                type: resource.split('.')[0],
                                isOriginal: searchName === 'original',
                                content: fse.readFileSync(resourcePath).toString(),
                                suffix: resource.split('.')[1]
                            };
                        }
                    }
                }
                return null;
            },
            bookResources: (root, args) => {
                let ret = [];
                const searchPaths = [
                    ['original', originalResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                    ['generated', generatedResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                ];
                for (const [searchName, searchPath] of searchPaths) {
                    if (!fse.existsSync(searchPath)) {
                        continue;
                    }
                    for (const resourceDir of fse.readdirSync(searchPath)) {
                        const resourceDirPath = path.join(searchPath, resourceDir);
                        if (!fse.lstatSync(resourceDirPath).isDirectory()) {
                            continue;
                        }
                        for (const bookResource of fse.readdirSync(resourceDirPath)) {
                            if (bookResource.split('.')[0] === args.bookCode) {
                                ret.push({
                                    type: resourceDir.replace('Books', ''),
                                    isOriginal: searchName === 'original',
                                    content: fse.readFileSync(path.join(resourceDirPath, bookResource)).toString(),
                                    suffix: bookResource.split('.')[1]
                                })
                            }
                        }
                    }
                }
                return ret;
            },
            bookResource: (root, args) => {
                const searchPaths = [
                    ['original', originalResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                    ['generated', generatedResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                ];
                for (const [searchName, searchPath] of searchPaths) {
                    if (!fse.existsSync(searchPath)) {
                        continue;
                    }
                    const resourceDirPath = path.join(searchPath, `${args.type}Books`);
                    if (!fse.existsSync(resourceDirPath) || !fse.lstatSync(resourceDirPath).isDirectory()) {
                        continue;
                    }
                    for (const bookResource of fse.readdirSync(resourceDirPath)) {
                        if (bookResource.split('.')[0] === args.bookCode) {
                            return {
                                type: args.type,
                                isOriginal: searchName === 'original',
                                content: fse.readFileSync(path.join(resourceDirPath, bookResource)).toString(),
                                suffix: bookResource.split('.')[1]
                            };
                        }
                    }
                }
                return null;
            },
            bookCodes: (root, args) => {
                let ret = new Set([]);
                const searchPaths = [
                    ['original', originalResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                    ['generated', generatedResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                ];
                for (const [searchName, searchPath] of searchPaths) {
                    if (!fse.existsSync(searchPath)) {
                        continue;
                    }
                    for (const resourceDir of fse.readdirSync(searchPath)) {
                        const resourceDirPath = path.join(searchPath, resourceDir);
                        if (!fse.lstatSync(resourceDirPath).isDirectory()) {
                            continue;
                        }
                        if (args.type && resourceDir !== `${args.type}Books`) {
                            continue;
                        }
                        for (const bookResource of fse.readdirSync(resourceDirPath)) {
                            const bookCode = bookResource.split('.')[0];
                            ret.add(bookCode);
                        }
                    }
                }
                return Array.from(ret).sort((a, b) => ptBooks[a].position - ptBooks[b].position);
            },
            bookResourceTypes: (root, args) => {
                let ret = [];
                const searchPaths = [
                    ['original', originalResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                    ['generated', generatedResourcePath(config.dataPath, orgsData[root.source].translationDir, root.id, root.revision)],
                ];
                for (const [searchName, searchPath] of searchPaths) {
                    if (!fse.existsSync(searchPath)) {
                        continue;
                    }
                    for (const resourceDir of fse.readdirSync(searchPath)) {
                        const resourceDirPath = path.join(searchPath, resourceDir);
                        if (!fse.lstatSync(resourceDirPath).isDirectory()) {
                            continue;
                        }
                        if (args.type && resourceDir !== `${args.type}Books`) {
                            continue;
                        }
                        ret.push(resourceDir.replace('Books', ''));
                    }
                }
                return ret;
            },
            hasSuccinctError: root => {
                return false;
            },
            hasLock: root => {
                return false;
            }
        },
        Org: {
            catalogEntries: (org, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for catalogEntries`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(`Required auth role 'admin' not found for catalogEntries`);
                }
                return filteredCatalog(org, args, context, org.entries);
            },
            catalogEntry: (org, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for catalogEntry`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(`Required auth role 'admin' not found for catalogEntry`);
                }
                context.orgData = org;
                context.orgHandler = orgHandlers[org.name];
                return org.entries
                    .filter(t => t.id === args.id)[0];
            },
        },
        CatalogEntry: {
            transId: root => root.id,
            isLocal: (trans, args, context) => fse.pathExists(transParentPath(config.dataPath, context.orgData.translationDir, trans.id)),
            isRevisionLocal: (trans, args, context) =>
                context.orgData.catalogHasRevisions ?
                    fse.pathExists(transPath(config.dataPath, context.orgData.translationDir, trans.id, trans.revision)) :
                    null,
        },
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
                const transOb = orgOb.entries.filter(t => t.id === args.entryId)[0];
                if (!transOb) {
                    return false;
                }
                try {
                    await orgHandlers[args.org].fetchUsfm(orgOb, transOb, config); // Adds owner and revision to transOb
                    const succinctP = succinctPath(config.dataPath, orgOb.translationDir, transOb.id, transOb.revision);
                    if (fse.pathExistsSync(succinctP)) {
                        fse.unlinkSync(succinctP);
                    }
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
                const transOb = orgOb.entries.filter(t => t.id === args.entryId)[0];
                if (!transOb) {
                    return false;
                }
                try {
                    await orgHandlers[args.org].fetchUsx(orgOb, transOb, config);  // Adds owner and revision to transOb
                    const succinctP = succinctPath(config.dataPath, orgOb.translationDir, transOb.id, transOb.revision);
                    if (fse.pathExistsSync(succinctP)) {
                        fse.unlinkSync(succinctP);
                    }
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
                    throw new Error(`Required auth role 'admin' not found for deleteLocalEntry`);
                }
                const orgOb = orgsData[args.org];
                if (!orgOb) {
                    return false;
                }
                try {
                    let pathDir = transPath(config.dataPath, orgOb.orgDir, args.id, args.revision);
                    if (fse.pathExistsSync(pathDir)) {
                        fse.rmSync(pathDir, {recursive: true});
                        pathDir = transParentPath(config.dataPath, orgOb.orgDir, args.id);
                        if (fse.readdirSync(pathDir).length === 0) {
                            fse.rmSync(pathDir, {recursive: true});
                        }
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
                    throw new Error(`Required auth role 'admin' not found for deleteSuccinctError`);
                }
                const orgOb = orgsData[args.org];
                if (!orgOb) {
                    return false;
                }
                const transOb = orgOb.entries.filter(t => t.id === args.entryId)[0];
                if (!transOb) {
                    return false;
                }
                const succinctEP = succinctErrorPath(config.dataPath, orgOb.translationDir, transOb.id);
                if (fse.pathExistsSync(succinctEP)) {
                    fse.removeSync(succinctEP);
                    return true;
                } else {
                    return false;
                }
            },
        },
    };

    if (config.includeMutations
    ) {
        return {...scalarResolvers, ...queryResolver, ...mutationResolver};
    } else {
        return {...scalarResolvers, ...queryResolver};
    }
}

module.exports = makeResolvers;
