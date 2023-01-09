const path = require('path');
const fse = require('fs-extra');
const {GraphQLScalarType, Kind} = require('graphql');
const {ptBooks} = require('proskomma-utils');
const {transPath, transParentPath, usfmDir, usxDir, succinctPath, succinctErrorPath, vrsPath, perfDir, simplePerfDir, sofriaDir} = require('../../lib/dataPaths');

const makeResolvers = async (orgsData, orgHandlers, config) => {

    const scalarRegexes = {
        OrgName: new RegExp(/^[A-Za-z0-9]{2,64}$/),
        TranslationId: new RegExp(/^[A-Za-z0-9_-]{1,64}$/),
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

    const translationIdScalar = new GraphQLScalarType({
        name: 'TranslationId',
        description: 'Identifier for a translation',
        serialize(value) {
            if (typeof value !== 'string') {
                return null;
            }
            if (!scalarRegexes.TranslationId.test(value)) {
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
            if (!scalarRegexes.TranslationId.test(ast.value)) {
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

    const filteredCatalog = (org, args, context, translations) => {
        context.orgData = org;
        context.orgHandler = orgHandlers[org.name];
        let ret = [...translations];
        if (args.withId) {
            ret = ret.filter(t => args.withId.includes(t.id));
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

    const localTranslations = orgData => {
        const ret = [];
        const td = path.resolve(config.dataPath, orgData.translationDir);
        for (const entryId of fse.readdirSync(td)) {
            for (const revision of fse.readdirSync(path.join(td, entryId))) {
                const transDir = path.join(td, entryId, revision);
                const metadata = fse.readJsonSync(path.join(transDir, 'metadata.json'));
                metadata.dir = transDir;
                ret.push(metadata);
            }
        }
        return ret;
    }

    const localTranslation = (org, entryId, revision) => {
        const translationPath = transPath(config.dataPath, org, entryId, revision);
        if (fse.pathExistsSync(translationPath)) {
            return fse.readJsonSync(path.join(translationPath, "metadata.json"));
        } else {
            return null;
        }
    }

    const hasAllFeatures = (trans, features) => {
        let ret = true;
        for (const f of features) {
            const fField = `n${f.substring(0, 1).toUpperCase()}${f.substring(1)}`;
            if (!trans.stats || !trans.stats[fField]) {
                ret = false;
                break;
            }
        }
        return ret;
    }

    const scalarResolvers = {
        OrgName: orgNameScalar,
        TranslationId: translationIdScalar,
        BookCode: bookCodeScalar,
        ContentType: ContentTypeScalar,
    }
    const queryResolver = {
        Query: {
            orgs: () => {
                return Object.values(orgsData);
            },
            org: (root, args, context) => {
                context.incidentLogger = config.incidentLogger;
                return orgsData[args.name];
            },
        },
        Org: {
            nCatalogEntries: (org, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for nCatalogEntries`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(`Required auth role 'admin' not found for nCatalogEntries`);
                }
                return org.translations.length
            },
            nLocalTranslations: (org, args) => {
                let ret = localTranslations(org);
                if (args.withUsfm) {
                    ret = ret.filter(t => fse.pathExistsSync(usfmDir(config.dataPath, org.translationDir, t.id, t.revision)));
                }
                if (args.withUsx) {
                    ret = ret.filter(t => fse.pathExistsSync(usxDir(config.dataPath, org.translationDir, t.id, t.revision)));
                }
                return ret.length;
            },
            catalogEntries: (org, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for catalogEntries`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(`Required auth role 'admin' not found for catalogEntries`);
                }
                return filteredCatalog(org, args, context, org.translations);
            },
            localTranslations: (org, args, context) => {
                return filteredCatalog(
                    org,
                    args,
                    context,
                    localTranslations(org) || [])
                    .filter(t => hasAllFeatures(t, args.withFeatures || []));
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
                return org.translations
                    .filter(t => t.id === args.id)[0];
            },
            localTranslation: (org, args, context) => {
                context.orgData = org;
                context.orgHandler = orgHandlers[org.name];
                return localTranslation(org.orgDir, args.id, args.revision);
            },
        },
        CatalogEntry: {
            isLocal: (trans, args, context) => fse.pathExists(transParentPath(config.dataPath, context.orgData.translationDir, trans.id)),
        },
        Translation: {
            resourceTypes: trans => trans.resourceTypes || [],
            nUsfmBooks: (trans, args, context) => {
                const usfmDirPath = usfmDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                if (fse.pathExistsSync(usfmDirPath)) {
                    return fse.readdirSync(usfmDirPath).length;
                } else {
                    return 0;
                }
            },
            usfmBookCodes: (trans, args, context) => {
                const usfmDirPath = usfmDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                if (fse.pathExistsSync(usfmDirPath)) {
                    return fse.readdirSync(usfmDirPath)
                        .map(p => p.split('.')[0])
                        .sort((a, b) => ptBooks[a].position - ptBooks[b].position);
                } else {
                    return [];
                }
            },
            hasUsfmBookCode: (trans, args, context) => {
                const usfmDirPath = usfmDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                if (fse.pathExistsSync(usfmDirPath)) {
                    return fse.readdirSync(usfmDirPath).map(p => p.split('.')[0]).includes(args.code);
                } else {
                    return false;
                }
            },
            hasUsfm: (trans, args, context) => {
                const usfmDirPath = usfmDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                return fse.pathExistsSync(usfmDirPath);
            },
            usfmForBookCode: (trans, args, context) => {
                const usfmDirPath = usfmDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                const bookPath = path.join(usfmDirPath, `${args.code}.usfm`);
                if (fse.pathExistsSync(bookPath)) {
                    return fse.readFileSync(bookPath).toString();
                } else {
                    return null;
                }
            },
            nUsxBooks: (trans, args, context) => {
                const usxDirPath = usxDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                if (fse.pathExistsSync(usxDirPath)) {
                    return fse.readdirSync(usxDirPath).length;
                } else {
                    return 0;
                }
            },
            usxBookCodes: (trans, args, context) => {
                const usxDirPath = usxDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                if (fse.pathExistsSync(usxDirPath)) {
                    return fse.readdirSync(usxDirPath)
                        .map(p => p.split('.')[0])
                        .sort((a, b) => ptBooks[a].position - ptBooks[b].position);
                } else {
                    return [];
                }
            },
            hasUsxBookCode: (trans, args, context) => {
                const usxDirPath = usxDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                if (fse.pathExistsSync(usxDirPath)) {
                    return fse.readdirSync(usxDirPath).map(p => p.split('.')[0]).includes(args.code);
                } else {
                    return false;
                }
            },
            hasUsx: (trans, args, context) => {
                const usxDirPath = usxDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                return fse.pathExistsSync(usxDirPath);
            },
            usxForBookCode: (trans, args, context) => {
                const usxDirPath = usxDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                const bookPath = path.join(usxDirPath, `${args.code}.usx`);
                if (fse.pathExistsSync(bookPath)) {
                    return fse.readFileSync(bookPath).toString();
                } else {
                    return null;
                }
            },
            hasPerf: (trans, args, context) => {
                const perfDirPath = perfDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                return fse.pathExistsSync(perfDirPath);
            },
            perfForBookCode: (trans, args, context) => {
                const perfDirPath = perfDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                const bookPath = path.join(perfDirPath, `${args.code}.json`);
                if (fse.pathExistsSync(bookPath)) {
                    return fse.readFileSync(bookPath).toString();
                } else {
                    return null;
                }
            },
            hasSimplePerf: (trans, args, context) => {
                const simplePerfDirPath = simplePerfDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                return fse.pathExistsSync(simplePerfDirPath);
            },
            simplePerfForBookCode: (trans, args, context) => {
                const simplePerfDirPath = simplePerfDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                const bookPath = path.join(simplePerfDirPath, `${args.code}.json`);
                if (fse.pathExistsSync(bookPath)) {
                    return fse.readFileSync(bookPath).toString();
                } else {
                    return null;
                }
            },
            hasSofria: (trans, args, context) => {
                const sofriaDirPath = sofriaDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                return fse.pathExistsSync(sofriaDirPath);
            },
            sofriaForBookCode: (trans, args, context) => {
                const sofriaDirPath = sofriaDir(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                const bookPath = path.join(sofriaDirPath, `${args.code}.json`);
                if (fse.pathExistsSync(bookPath)) {
                    return fse.readFileSync(bookPath).toString();
                } else {
                    return null;
                }
            },
            hasSuccinct: (trans, args, context) => {
                const succinctP = succinctPath(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                return fse.pathExistsSync(succinctP);
            },
            succinct: (trans, args, context) => {
                const succinctP = succinctPath(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                if (fse.pathExistsSync(succinctP)) {
                    return fse.readFileSync(succinctP).toString();
                }
                return null;
            },
            hasSuccinctError: (trans, args, context) => {
                const succinctEP = succinctErrorPath(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                return fse.pathExistsSync(succinctEP);
            },
            succinctError: (trans, args, context) => {
                const succinctEP = succinctErrorPath(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                if (fse.pathExistsSync(succinctEP)) {
                    return fse.readFileSync(succinctEP).toString();
                }
                return null;
            },
            hasVrs: (trans, args, context) => {
                const vrsP = vrsPath(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                return fse.pathExistsSync(vrsP);
            },
            vrs: (trans, args, context) => {
                const vrsP = vrsPath(config.dataPath, context.orgData.translationDir, trans.id, trans.revision);
                if (fse.pathExistsSync(vrsP)) {
                    return fse.readFileSync(vrsP).toString();
                }
                return null;
            },
            nOT: (trans) => trans.stats?.nOT || 0,
            nNT: (trans) => trans.stats?.nNT || 0,
            nDC: (trans) => trans.stats?.nDC || 0,
            nIntroductions: (trans) => trans.stats?.nIntroductions || 0,
            nXrefs: (trans) => trans.stats?.nXrefs || 0,
            nFootnotes: (trans) => trans.stats?.nFootnotes || 0,
            nHeadings: (trans) => trans.stats?.nHeadings || 0,
            nStrong: (trans) => trans.stats?.nStrong || 0,
            nLemma: (trans) => trans.stats?.nLemma || 0,
            nGloss: (trans) => trans.stats?.nGloss || 0,
            nContent: (trans) => trans.stats?.nContent || 0,
            nOccurrences: (trans) => trans.stats?.nOccurrences || 0,
            nChapters: (trans) => trans.stats?.nChapters || 0,
            nVerses: (trans) => trans.stats?.nVerses || 0,
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
                const transOb = orgOb.translations.filter(t => t.id === args.translationId)[0];
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
                const transOb = orgOb.translations.filter(t => t.id === args.translationId)[0];
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
            deleteLocalTranslation: async (root, args, context) => {
                if (!context.auth || !context.auth.authenticated) {
                    throw new Error(`No auth found for deleteLocalTranslation mutation`);
                }
                if (!context.auth.roles || !context.auth.roles.includes("admin")) {
                    throw new Error(`Required auth role 'admin' not found for deleteLocalTranslation`);
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
                const transOb = orgOb.translations.filter(t => t.id === args.translationId)[0];
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

    if (config.includeMutations) {
        return {...scalarResolvers, ...queryResolver, ...mutationResolver};
    } else {
        return {...scalarResolvers, ...queryResolver};
    }
};

module.exports = makeResolvers;
