const fse = require('fs-extra');
const path = require("path");
const appRoot = path.resolve(".");

// CLI error helper function

const croak = msg => {
    const usageMessage = `%msg%\nUSAGE: node src/index.js [configFilePath]`
    console.log(usageMessage.replace('%msg%', msg));
    process.exit(1);
}

// Default config - override by passing config JSON file
const defaultConfig = {
    name: null,
    hostName: 'localhost',
    port: 2468,
    dataPath: path.resolve(appRoot, 'data'),
    structurePath: path.resolve(appRoot, 'default_structure'),
    logAccess: false,
    logFormat: "combined",
    useCors: false,
    debug: false,
    processFrequency: 'never',
    orgs: [], // Empty array means 'all',
    verbose: false,
    includeMutations: false,
    redirectToRoot: [],
    deleteGenerated: false,
    nWorkers: 1,
    sessionTimeoutInMins: 15,
    staticPaths: [],
    superusers: {},
    orgsConfig: [],
    localContent: false,
}

const staticPathTemplate = {
    path: true,
    url: true,
    redirects: true,
    redirectTarget: true,
}

const orgConfigTemplate = {
    name: true,
    resourceTypes: true,
    resourceFormats: true,
    languages: true,
    owners: true,
    whitelist: true,
    blacklist: true,
    syncFrequency: true,
    peerUrl: true,
    etc: true,
}

const cronOptions = {
    '1 min': '* * * * *',
    '5 min': '*/5 * * * *',
    '10 min': '*/10 * * * *',
    '15 min': '*/15 * * * *',
    '20 min': '*/20 * * * *',
    '30 min': '*/30 * * * *',
    '1 hr': '* * * *',
    '4 hr': '*/4 * * *',
    '8 hr': '*/8 * * *',
    '12 hr': '*/12 * * *',
    '1 day': '* * *',
};

const syncCronOptions = {
    '4 hr': '*/4 * * *',
    '8 hr': '*/8 * * *',
    '12 hr': '*/12 * * *',
    '1 day': '* * *',
    '7 day': '*/7 * *',
    '14 day': '*/14 * *',
    '1 mon': '1 * *'
};

const resourceFormats = [
    "original",
    "succinct",
    "perf",
    "sofria"
]

const superuserRecord = {
    roles: true,
    password: true
}

const superuserRoles = ["admin", "archivist"];

const logFormatOptions = ["combined", "common", "dev", "short", "tiny"];

function makeConfig(providedConfig) {
    for (const key of Object.keys(providedConfig)) {
        if (!(key in defaultConfig)) {
            croak(`Unknown top-level config file option '${key}'`);
        }
    }
    const config = defaultConfig;
    if (!providedConfig.name) {
        croak(`CONFIG ERROR: you must specify a server name`);
    }
    if (typeof providedConfig.name !== 'string') {
        croak(`CONFIG ERROR: name should be a string, not '${providedConfig.name}'`);
    }
    const nameRE = new RegExp('^[A-Za-z][A-Za-z0-9_]*[A-Za-z0-9]$');
    if (!nameRE.test(providedConfig.name)) {
        croak(`CONFIG ERROR: name '${providedConfig.name}' contains illegal characters'`);
    }
    config.name = providedConfig.name;
    if (providedConfig.hostName) {
        if (typeof providedConfig.hostName !== 'string') {
            croak(`CONFIG ERROR: hostName should be a string, not '${providedConfig.port}'`);
        }
        config.hostName = providedConfig.hostName;
    }
    if (providedConfig.port) {
        if (
            typeof providedConfig.port !== 'number' ||
            providedConfig.port.toString().includes('.') ||
            providedConfig.port < 1 ||
            providedConfig.port > 65535) {
            croak(`CONFIG ERROR: port should be an integer between 1 and 65535, not '${providedConfig.port}'`);
        }
        config.port = providedConfig.port;
    }
    if (providedConfig.dataPath) {
        if (
            typeof providedConfig.dataPath !== 'string') {
            croak(`CONFIG ERROR: dataPath should be a string, not '${providedConfig.dataPath}'`);
        }
        const fqPath = path.resolve(providedConfig.dataPath);
        if (!fse.existsSync(fqPath) || !fse.lstatSync(fqPath).isDirectory()) {
            croak(`CONFIG ERROR: dataPath '${fqPath}' does not exist or is not a directory`);
        }
        config.dataPath = fqPath;
    }
    const structurePath = providedConfig.structurePath || config.structurePath; // Always check structurePath
    if (
        typeof structurePath !== 'string') {
        croak(`CONFIG ERROR: structurePath should be a string, not '${structurePath}'`);
    }
    const fqPath = path.resolve(structurePath);
    if (!fse.existsSync(fqPath) || !fse.lstatSync(fqPath).isDirectory()) {
        croak(`CONFIG ERROR: structurePath '${fqPath}' does not exist or is not a directory`);
    }
    const structureJsonPath = path.join(fqPath, 'structure.json');
    if (!fse.existsSync(structureJsonPath) || fse.lstatSync(structureJsonPath).isDirectory()) {
        croak(`CONFIG ERROR: structure.json in '${fqPath}' does not exist or is a directory`);
    }
    for (const structureDirName of ["pages", "metadata", "footer"]) {
        const structureDir = path.join(fqPath, structureDirName);
        if (!fse.existsSync(structureDir) || !fse.lstatSync(structureDir).isDirectory()) {
            croak(`CONFIG ERROR: directory ${structureDirName} in '${fqPath}' does not exist or is not a directory`);
        }
    }
    try {
        const structureOb = fse.readJsonSync(structureJsonPath);
        for (const structureKey of ["languages", "urls"]) {
            if (!structureOb[structureKey]) {
                croak(`CONFIG ERROR: Required key '${structureKey}' not found in structure.json`);
            }
            if (!Array.isArray(structureOb[structureKey])) {
                croak(`CONFIG ERROR: Value of '${structureKey}' in structure.json must be an array, not ${JSON.stringify(structureOb[structureKey])}`);
            }
            for (const structureElement of structureOb[structureKey]) {
                if (typeof structureElement !== 'string' || structureElement.length < 2) {
                    croak(`CONFIG ERROR: Element of '${structureKey}' in structure.json must be a string with at least two characters, not '${structureElement}'`);
                }
            }
        }
        if (structureOb["languages"].length === 0) {
            croak(`CONFIG ERROR: At least one language must be specified in structure.json`);
        }
        for (const lang of structureOb["languages"]) {
            const structureLangMetadataPath = path.join(fqPath, 'metadata', `${lang}.json`);
            if (!fse.existsSync(structureLangMetadataPath) || fse.lstatSync(structureLangMetadataPath).isDirectory()) {
                croak(`CONFIG ERROR: Metadata JSON file for ${lang} in '${fqPath}' does not exist or is a directory`);
            }
        }
        for (const url of [...structureOb["urls"], "home"]) {
            const urlDir = path.join(fqPath, 'pages', url);
            if (!fse.existsSync(urlDir) || !fse.lstatSync(urlDir).isDirectory()) {
                croak(`CONFIG ERROR: '${url}' in '${fqPath}' pages directory does not exist or is not itself a directory`);
            }
        }
    } catch (err) {
        croak(`CONFIG ERROR: Exception while checking structure: ${JSON.stringify(err)}`);
    }
    config.structurePath = fqPath;
    if (providedConfig.staticPath) {
        croak('CONFIG ERROR: the staticPath config option has been replaced by staticPaths');
    }
    if (providedConfig.staticPaths) {
        if (!Array.isArray(providedConfig.staticPaths)) {
            croak(`CONFIG ERROR: staticPaths, if present, should be an array, not '${providedConfig.staticPaths}'`);
        }
        let specs = [];
        for (const staticPathSpec of providedConfig.staticPaths) {
            for (const specKey of Object.keys(staticPathSpec)) {
                if (!staticPathTemplate[specKey]) {
                    croak(`Unknown staticPaths spec option '${specKey}'`);
                }
            }
            const spec = {};
            if (typeof staticPathSpec !== 'object' || Array.isArray(staticPathSpec)) {
                croak(`CONFIG ERROR: static path spec should be an object, not '${JSON.stringify(staticPathSpec)}'`);
            }
            if (!staticPathSpec.path) {
                croak(`CONFIG ERROR: static path spec must contain a path: '${JSON.stringify(staticPathSpec)}'`);
            }
            if (!staticPathSpec.url) {
                croak(`CONFIG ERROR: static path spec must contain a url: '${JSON.stringify(staticPathSpec)}'`);
            }
            const fqPath = path.resolve(staticPathSpec.path);
            if (!fse.existsSync(fqPath) || !fse.lstatSync(fqPath).isDirectory()) {
                croak(`CONFIG ERROR: static path '${fqPath}' does not exist or is not a directory`);
            }
            spec.path = fqPath;
            if (!staticPathSpec.url.startsWith('/')) {
                croak(`CONFIG ERROR: static url '${staticPathSpec.url}' does not begin with a /`);
            }
            spec.url = staticPathSpec.url;
            if (staticPathSpec.redirectTarget) {
                const fqPath = path.resolve(staticPathSpec.redirectTarget);
                if (!fse.existsSync(fqPath)) {
                    croak(`CONFIG ERROR: redirectTarget '${fqPath}' does not exist`);
                }
                spec.redirectTarget = fqPath;
            }
            spec.redirects = [];
            if (staticPathSpec.redirects) {
                if (!staticPathSpec.redirectTarget) {
                    croak(`CONFIG ERROR: cannot use 'redirects' without 'redirectTarget' in staticPaths`);
                }
                if (!Array.isArray(staticPathSpec.redirects)) {
                    croak(`CONFIG ERROR: static path redirects, if present, should be an array, not '${staticPathSpec.redirects}'`);
                }
                for (const redirect of staticPathSpec.redirects) {
                    if (typeof redirect !== 'string') {
                        croak(`CONFIG ERROR: redirect elements should be strings, not '${redirect}'`);
                    }
                    if (!redirect.startsWith('/')) {
                        croak(`CONFIG ERROR: redirect elements should start with '/' (from '${redirect}')`);
                    }
                }
                spec.redirects = staticPathSpec.redirects;
            }
            specs.push(spec);
        }
        config.staticPaths = specs;
    }
    if (providedConfig.redirectToRoot) {
        croak("CONFIG ERROR: redirectToRoot has been replaced by 'redirects' inside static path specs");
    }
    if ('debug' in providedConfig) {
        if (typeof providedConfig.debug !== 'boolean') {
            croak(`CONFIG ERROR: debug should be boolean, not ${typeof providedConfig.debug}`);
        }
        config.debug = providedConfig.debug;
    }
    if ('logAccess' in providedConfig) {
        if (typeof providedConfig.logAccess !== 'boolean') {
            croak(`CONFIG ERROR: logAccess should be boolean, not ${typeof providedConfig.logAccess}`);
        }
        config.logAccess = providedConfig.logAccess;
    }
    if ('logFormat' in providedConfig) {
        if (!logFormatOptions.includes(providedConfig.logFormat)) {
            croak(`CONFIG ERROR: unknown logFormat option '${providedConfig.logFormat}' - should be one of ${logFormatOptions.join(', ')}`);
        }
        config.logFormat = providedConfig.logFormat;
    }
    if (providedConfig.accessLogPath) {
        if (
            typeof providedConfig.accessLogPath !== 'string') {
            croak(`CONFIG ERROR: accessLogPath, if present, should be a string, not '${providedConfig.accessLogPath}'`);
        }
        config.accessLogPath = path.resolve(providedConfig.accessLogPath);
    }
    if ('includeMutations' in providedConfig) {
        if (typeof providedConfig.includeMutations !== 'boolean') {
            croak(`CONFIG ERROR: includeMutations should be boolean, not ${typeof providedConfig.includeMutations}`);
        }
        config.includeMutations = providedConfig.includeMutations;
    }
    if ('superusers' in providedConfig) {
        if (typeof providedConfig.superusers !== 'object' || Array.isArray(providedConfig.superusers)) {
            croak(`CONFIG ERROR: superusers, if present, should be an object, not '${JSON.stringify(providedConfig.superusers)}'`);
        }
        for (const suOb of Object.values(providedConfig.superusers)) {
            if (typeof suOb !== 'object' || Array.isArray(suOb)) {
                croak(`CONFIG ERROR: superuser records should be an object, not '${JSON.stringify(suOb)}'`);
            }
            for (const suKey of Object.keys(suOb)) {
                if (!superuserRecord[suKey]) {
                    croak(`Unknown superuser record option '${suKey}'`);
                }
            }
            if (typeof suOb.password !== 'string') {
                croak(`CONFIG ERROR: superuser password hash should be a string, not '${JSON.stringify(suOb.password)}'`);
            }
            if (!Array.isArray(suOb.roles)) {
                croak(`CONFIG ERROR: superuser roles should be an array, not '${JSON.stringify(suOb.roles)}'`);
            }
            if (suOb.roles.length === 0) {
                croak(`CONFIG ERROR: superuser roles array should not be empty`);
            }
            for (const role of suOb.roles) {
                if (typeof role !== 'string') {
                    croak(`CONFIG ERROR: superuser role should be a string, not '${JSON.stringify(role)}'`);
                }
                if (!superuserRoles.includes(role)) {
                    croak(`CONFIG ERROR: superuser role should be one of ${superuserRoles.join(', ')}, not '${role}'`);
                }
            }
        }
        config.superusers = providedConfig.superusers;
    } else {
        config.superusers = {};
    }
    if ('sessionTimeoutInMins' in providedConfig) {
        if (
            typeof providedConfig.sessionTimeoutInMins !== 'number' ||
            !cronOptions[`${providedConfig.sessionTimeoutInMins} min`]) {
            croak(`CONFIG ERROR: sessionTimeoutInMins should be 1, 5, 10, 15, 20 or 30, not '${providedConfig.sessionTimeoutInMins}'`);
        }
        config.sessionTimeoutInMins = providedConfig.sessionTimeoutInMins;
    }
    if ('useCors' in providedConfig) {
        if (typeof providedConfig.useCors !== 'boolean') {
            croak(`CONFIG ERROR: useCors should be boolean, not ${typeof providedConfig.useCors}`);
        }
        config.useCors = providedConfig.useCors;
    }
    if ('processFrequency' in providedConfig) {
        if (providedConfig.processFrequency !== 'never' && !(providedConfig.processFrequency in cronOptions)) {
            croak(`CONFIG ERROR: unknown processFrequency option '${providedConfig.processFrequency}' - should be one of never, ${Object.keys(cronOptions).join(', ')}`);
        }
        config.processFrequency = providedConfig.processFrequency;
    }
    if (providedConfig.nWorkers) {
        if (
            typeof providedConfig.nWorkers !== 'number' ||
            providedConfig.nWorkers.toString().includes('.') ||
            providedConfig.nWorkers < 1 ||
            providedConfig.nWorkers > 16) {
            croak(`CONFIG ERROR: nWorkers should be an integer between 1 and 16, not '${providedConfig.nWorkers}'`);
        }
        config.nWorkers = providedConfig.nWorkers;
    }
    if ('deleteGenerated' in providedConfig) {
        if (typeof providedConfig.deleteGenerated !== 'boolean') {
            croak(`CONFIG ERROR: deleteGenerated should be boolean, not ${typeof providedConfig.useCors}`);
        }
        config.deleteGenerated = providedConfig.deleteGenerated;
    }
    if ('orgs' in providedConfig) {
        if (!Array.isArray(providedConfig.orgs)) {
            croak(`CONFIG ERROR: orgs should be an array, not '${providedConfig.orgs}'`);
        }
        for (const org of providedConfig.orgs) {
            if (typeof org !== "string") {
                croak(`CONFIG ERROR: each orgs element should be a string, not '${JSON.stringify(org)}'`);
            }
            const orgRE = new RegExp(/^[A-Za-z0-9][A-Za-z0-9_]{0,62}[A-Za-z0-9]$/);
            if (!orgRE.test(org)) {
                croak(`CONFIG ERROR: each orgs element should match the regex '^[A-Za-z0-9][A-Za-z0-9_]{0,62}[A-Za-z0-9]$', not '${org}'`);
            }
        }
        config.orgs = providedConfig.orgs;
    }
    if ('localContent' in providedConfig) {
        if (typeof providedConfig.localContent !== 'boolean') {
            croak(`CONFIG ERROR: localContent should be boolean, not ${typeof providedConfig.localContent}`);
        }
        config.localContent = providedConfig.localContent;
        if (!config.localContent) {
            config.orgs = config.orgs.filter(o => o !== config.name);
        }
    }
    if (providedConfig.orgsConfig) {
        if (!Array.isArray(providedConfig.orgsConfig)) {
            croak(`CONFIG ERROR: orgsConfig, if present, should be an array, not '${providedConfig.orgsConfig}'`);
        }
        config.orgsConfig = [];
        for (const orgConfig of providedConfig.orgsConfig) {
            if (typeof orgConfig !== 'object' || Array.isArray(orgConfig)) {
                croak(`CONFIG ERROR: each orgsConfig spec should be an object, not '${JSON.stringify(orgConfig)}'`);
            }
            const orgOb = {};
            for (const orgKey of Object.keys(orgConfig)) {
                if (!orgConfigTemplate[orgKey]) {
                    croak(`Unknown orgsConfig spec option '${orgKey}'`);
                }
            }
            if (!orgConfig.name) {
                croak(`CONFIG ERROR: each orgsConfig spec must have a name`);
            }
            if (!nameRE.test(orgConfig.name)) {
                croak(`CONFIG ERROR: orgsConfig name '${orgConfig.name}' for ${orgConfig.name} contains illegal characters'`);
            }
            orgOb.name = orgConfig.name;
            if (orgConfig.resourceTypes) {
                if (!Array.isArray(orgConfig.resourceTypes)) {
                    croak(`CONFIG ERROR: orgsConfig resourceTypes for ${orgConfig.name}, if present, must be an array, not '${orgConfig.resourceTypes}'`);
                }
                for (const resourceType of orgConfig.resourceTypes) {
                    if (typeof resourceType !== "string") {
                        croak(`CONFIG ERROR: each orgsConfig resourceType element for ${orgConfig.name} should be a string, not '${JSON.stringify(resourceType)}'`);
                    }
                }
                orgOb.resourceTypes = orgConfig.resourceTypes;
            } else {
                orgOb.resourceTypes = [];
            }
            if (orgConfig.resourceFormats) {
                if (!Array.isArray(orgConfig.resourceFormats)) {
                    croak(`CONFIG ERROR: orgsConfig resourceFormats for ${orgConfig.name}, if present, must be an array, not '${orgConfig.resourceFormats}'`);
                }
                for (const resourceFormat of orgConfig.resourceFormats) {
                    if (typeof resourceFormat !== "string") {
                        croak(`CONFIG ERROR: each orgsConfig resourceFormat element for ${orgConfig.name} should be a string, not '${JSON.stringify(resourceFormat)}'`);
                    }
                    if (!resourceFormats.includes(resourceFormat)) {
                        croak(`CONFIG ERROR: each orgsConfig resourceFormat element for ${orgConfig.name} should be one of ${resourceFormats.join(', ')}, not '${JSON.stringify(resourceFormat)}'`);
                    }
                }
                orgOb.resourceFormats = orgConfig.resourceFormats;
            } else {
                orgOb.resourceFormats = [];
            }
            if (orgConfig.languages) {
                if (!Array.isArray(orgConfig.languages)) {
                    croak(`CONFIG ERROR: orgsConfig languages for ${orgConfig.name}, if present, must be an array, not '${orgConfig.languages}'`);
                }
                for (const language of orgConfig.languages) {
                    if (typeof language !== "string") {
                        croak(`CONFIG ERROR: each orgsConfig language element for ${orgConfig.name} should be a string, not '${JSON.stringify(language)}'`);
                    }
                }
                orgOb.languages = orgConfig.languages;
            } else {
                orgOb.languages = [];
            }
            if (orgConfig.owners) {
                if (!Array.isArray(orgConfig.owners)) {
                    croak(`CONFIG ERROR: orgsConfig owners for ${orgConfig.name}, if present, must be an array, not '${orgConfig.owners}'`);
                }
                for (const owner of orgConfig.owners) {
                    if (typeof owner !== "string") {
                        croak(`CONFIG ERROR: each orgsConfig owner element for ${orgConfig.name} should be a string, not '${JSON.stringify(owner)}'`);
                    }
                }
                orgOb.owners = orgConfig.owners;
            } else {
                orgOb.owners = [];
            }
            if (orgConfig.whitelist) {
                if (!Array.isArray(orgConfig.whitelist)) {
                    croak(`CONFIG ERROR: orgsConfig whitelist for ${orgConfig.name}, if present, must be an array, not '${orgConfig.whitelist}'`);
                }
                for (const white of orgConfig.whitelist) {
                    if (typeof white !== 'object' || Array.isArray(white)) {
                        croak(`CONFIG ERROR: orgsConfig whitelist elements for ${orgConfig.name} should be an object, not '${JSON.stringify(white)}'`);
                    }
                    if (Object.keys(white).length === 0) {
                        croak(`CONFIG ERROR: orgsConfig whitelist elements for ${orgConfig.name} should contain at least one value`);
                    }
                    for (const whiteField of ["owner", "id", "revision"]) {
                        if (white[whiteField] && typeof white[whiteField] !== 'string') {
                            croak(`CONFIG ERROR: ${whiteField} field in orgsConfig whitelist elements for ${orgConfig.name} must be a string, not '${whiteField}'`);
                        }
                    }
                }
                orgOb.whitelist = orgConfig.whitelist;
            } else {
                orgOb.whitelist = [];
            }
            if (orgConfig.blacklist) {
                if (!Array.isArray(orgConfig.blacklist)) {
                    croak(`CONFIG ERROR: orgsConfig blacklist for ${orgConfig.name}, if present, must be an array, not '${orgConfig.blacklist}'`);
                }
                for (const black of orgConfig.blacklist) {
                    if (typeof black !== 'object' || Array.isArray(black)) {
                        croak(`CONFIG ERROR: orgsConfig blacklist elements for ${orgConfig.name} should be an object, not '${JSON.stringify(black)}'`);
                    }
                    if (Object.keys(black).length === 0) {
                        croak(`CONFIG ERROR: orgsConfig blacklist elements for ${orgConfig.name} should contain at least one value`);
                    }
                    for (const blackField of ["owner", "id", "revision"]) {
                        if (black[blackField] && typeof black[blackField] !== 'string') {
                            croak(`CONFIG ERROR: ${blackField} field in orgsConfig blacklist elements for ${orgConfig.name} must be a string, not '${blackField}'`);
                        }
                    }
                }
                orgOb.blacklist = orgConfig.blacklist;
            } else {
                orgOb.blacklist = [];
            }
            if (orgConfig.syncFrequency) {
                if (typeof orgConfig.syncFrequency !== 'string') {
                    croak(`CONFIG ERROR: orgsConfig syncFrequency for ${orgConfig.name}, if present, must be a string, not '${orgConfig.syncFrequency}'`);
                }
                if (orgConfig.syncFrequency !== 'never' && !(orgConfig.syncFrequency in syncCronOptions)) {
                    croak(`CONFIG ERROR: unknown orgConfig syncFrequency option '${orgConfig.syncFrequency}' for ${orgConfig.name} - should be one of never, ${Object.keys(syncCronOptions).join(', ')}`);
                }
                orgOb.syncFrequency = orgConfig.syncFrequency;
            } else {
                orgOb.syncFrequency = "never";
            }
            if (orgConfig.peerUrl) {
                if (typeof orgConfig.peerUrl !== 'string') {
                    croak(`CONFIG ERROR: orgsConfig peerUrl for ${orgConfig.name}, if present, must be a string, not '${orgConfig.peerUrl}'`);
                }
                orgOb.peerUrl = orgConfig.peerUrl;
            } else {
                orgOb.peerUrl = null;
            }
            if (orgConfig.etc) {
                if (typeof orgConfig.etc !== 'object' || Array.isArray(orgConfig.etc)) {
                    croak(`CONFIG ERROR: orgsConfig etc for ${orgConfig.name}, if present, should be an object, not '${JSON.stringify(orgConfig.etc)}'`);
                }
                orgOb.etc = orgConfig.etc;
            } else {
                orgOb.etc = {};
            }
            config.orgsConfig.push(orgOb);
        }
    }
    if ('verbose' in providedConfig) {
        if (typeof providedConfig.verbose !== 'boolean') {
            croak(`CONFIG ERROR: verbose should be boolean, not ${typeof providedConfig.verbose}`);
        }
        config.verbose = providedConfig.verbose;
    }
    return config;
}

const staticDescription = specs => {
    return 'Static Paths:\n' +
        specs.map(
            sp =>
                `      serve '${sp.path}'\n        at '${sp.url}${sp.redirects.length > 1 ? "\n        redirecting " + sp.redirects.join(', ') + '\n          to ' + sp.redirectTarget + "'" : ""}`
        ).join('\n')
}

const orgsConfigDescription = configs => {
    return 'Org Configs:\n' +
        configs.map(
            cf => {
                let lines = [`      ${cf.name}`];
                lines.push(`        ${cf.syncFrequency === 'never' ? 'Never sync' : 'Sync every ' + cf.syncFrequency}`);
                if (cf.peerUrl) {
                    lines.push(`        Peer org at '${cf.peerUrl}'`);
                }
                if (cf.resourceTypes.length > 0) {
                    lines.push(`        Pull resources of type ${cf.resourceTypes.join(', ')}`);
                }
                if (cf.resourceFormats.length > 0) {
                    lines.push(`        Pull resources as ${cf.resourceFormats.join(', ')}`);
                }
                if (cf.languages.length > 0) {
                    lines.push(`        Pull resources with language ${cf.languages.join(', ')}`);
                }
                if (cf.owners.length > 0) {
                    lines.push(`        Pull resources owned by ${cf.owners.join(', ')}`);
                }
                if (cf.whitelist.length > 0) {
                    lines.push(`        ${cf.whitelist.length} item${cf.whitelist.length === 1 ? "" : "s"} in whitelist`);
                }
                if (cf.blacklist.length > 0) {
                    lines.push(`        ${cf.blacklist.length} item${cf.blacklist.length === 1 ? "" : "s"} in blacklist`);
                }
                if (Object.keys(cf.etc).length > 0) {
                    lines.push(`        ${Object.keys(cf.etc).length} item${Object.keys(cf.etc).length === 1 ? "" : "s"} in etc`);
                }
                return lines.join('\n');
            }).join("\n");
}

const configSummary = config => `  Server ${config.name} is listening on ${config.hostName}:${config.port}
    Debug ${config.debug ? "en" : "dis"}abled
    Verbose ${config.verbose ? "en" : "dis"}abled
    Access logging ${!config.logAccess ? "disabled" : `to ${config.accessLogPath || 'console'} in Morgan '${config.logFormat}' format`}
    CORS ${config.useCors ? "en" : "dis"}abled
    Mutations ${config.includeMutations ? "en" : "dis"}abled
    ${config.orgsConfig ? `${orgsConfigDescription(config.orgsConfig)}` : "No org configuration"}
    Local content ${config.localContent ? "en" : "dis"}abled
    Data directory is ${config.dataPath}
    Structure directory is ${config.structurePath}
    ${config.staticPaths ? `${staticDescription(config.staticPaths)}` : "No static paths"}
    Process new data ${config.processFrequency === 'never' ? "disabled" : `every ${config.processFrequency}
    ${config.nWorkers} worker thread${config.nWorkers === 1 ? "" : "s"}
    ${Object.keys(config.superusers).length} superuser${Object.keys(config.superusers).length === 1 ? "" : "s"}
    ${Object.keys(config.superusers).length === 0 ? "" : `Session cookies expire after ${config.sessionTimeoutInMins} min`}
    ${config.deleteGenerated ? "Delete all generated content" : "Delete lock files only"} on startup
`}`

module.exports = {makeConfig, cronOptions, configSummary};
