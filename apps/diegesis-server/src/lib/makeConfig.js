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
        croak(`ERROR: you must specify a server name`);
    }
    if (typeof providedConfig.name !== 'string') {
        croak(`ERROR: name should be a string, not '${providedConfig.name}'`);
    }
    const nameRE = new RegExp('^[A-Za-z][A-Za-z0-9_]*[A-Za-z0-9]$');
    if (!nameRE.test(providedConfig.name)) {
        croak(`ERROR: name '${providedConfig.name}' contains illegal characters'`);
    }
    config.name = providedConfig.name;
    if (providedConfig.hostName) {
        if (typeof providedConfig.hostName !== 'string') {
            croak(`ERROR: hostName should be a string, not '${providedConfig.port}'`);
        }
        config.hostName = providedConfig.hostName;
    }
    if (providedConfig.port) {
        if (
            typeof providedConfig.port !== 'number' ||
            providedConfig.port.toString().includes('.') ||
            providedConfig.port < 1 ||
            providedConfig.port > 65535) {
            croak(`ERROR: port should be an integer between 1 and 65535, not '${providedConfig.port}'`);
        }
        config.port = providedConfig.port;
    }
    if (providedConfig.dataPath) {
        if (
            typeof providedConfig.dataPath !== 'string') {
            croak(`ERROR: dataPath should be a string, not '${providedConfig.dataPath}'`);
        }
        const fqPath = path.resolve(providedConfig.dataPath);
        if (!fse.existsSync(fqPath) || !fse.lstatSync(fqPath).isDirectory()) {
            croak(`ERROR: dataPath '${fqPath}' does not exist or is not a directory`);
        }
        config.dataPath = fqPath;
    }
    if (providedConfig.staticPath) {
        croak('ERROR: the staticPath config option has been replaced by staticPaths');
    }
    if (providedConfig.staticPaths) {
        if (!Array.isArray(providedConfig.staticPaths)) {
            croak(`ERROR: staticPaths, if present, should be an array, not '${providedConfig.staticPaths}'`);
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
                croak(`ERROR: static path spec should be an object, not '${JSON.stringify(staticPathSpec)}'`);
            }
            if (!staticPathSpec.path) {
                croak(`ERROR: static path spec must contain a path: '${JSON.stringify(staticPathSpec)}'`);
            }
            if (!staticPathSpec.url) {
                croak(`ERROR: static path spec must contain a url: '${JSON.stringify(staticPathSpec)}'`);
            }
            const fqPath = path.resolve(staticPathSpec.path);
            if (!fse.existsSync(fqPath) || !fse.lstatSync(fqPath).isDirectory()) {
                croak(`ERROR: static path '${fqPath}' does not exist or is not a directory`);
            }
            spec.path = fqPath;
            if (!staticPathSpec.url.startsWith('/')) {
                croak(`ERROR: static url '${staticPathSpec.url}' does not begin with a /`);
            }
            spec.url = staticPathSpec.url;
            if (staticPathSpec.redirectTarget) {
                const fqPath = path.resolve(staticPathSpec.redirectTarget);
                if (!fse.existsSync(fqPath)) {
                    croak(`ERROR: redirectTarget '${fqPath}' does not exist`);
                }
                spec.redirectTarget = fqPath;
            }
            spec.redirects = [];
            if (staticPathSpec.redirects) {
                if (!staticPathSpec.redirectTarget) {
                    croak(`ERROR: cannot use 'redirects' without 'redirectTarget' in staticPaths`);
                }
                if (!Array.isArray(staticPathSpec.redirects)) {
                    croak(`ERROR: static path redirects, if present, should be an array, not '${staticPathSpec.redirects}'`);
                }
                for (const redirect of staticPathSpec.redirects) {
                    if (typeof redirect !== 'string') {
                        croak(`ERROR: redirect elements should be strings, not '${redirect}'`);
                    }
                    if (!redirect.startsWith('/')) {
                        croak(`ERROR: redirect elements should start with '/' (from '${redirect}')`);
                    }
                }
                spec.redirects = staticPathSpec.redirects;
            }
            specs.push(spec);
        }
        config.staticPaths = specs;
    }
    if (providedConfig.redirectToRoot) {
        croak("ERROR: redirectToRoot has been replaced by 'redirects' inside static path specs");
    }
    if ('debug' in providedConfig) {
        if (typeof providedConfig.debug !== 'boolean') {
            croak(`ERROR: debug should be boolean, not ${typeof providedConfig.debug}`);
        }
        config.debug = providedConfig.debug;
    }
    if ('logAccess' in providedConfig) {
        if (typeof providedConfig.logAccess !== 'boolean') {
            croak(`ERROR: logAccess should be boolean, not ${typeof providedConfig.logAccess}`);
        }
        config.logAccess = providedConfig.logAccess;
    }
    if ('logFormat' in providedConfig) {
        if (!logFormatOptions.includes(providedConfig.logFormat)) {
            croak(`ERROR: unknown logFormat option '${providedConfig.logFormat}' - should be one of ${logFormatOptions.join(', ')}`);
        }
        config.logFormat = providedConfig.logFormat;
    }
    if (providedConfig.accessLogPath) {
        if (
            typeof providedConfig.accessLogPath !== 'string') {
            croak(`ERROR: accessLogPath, if present, should be a string, not '${providedConfig.accessLogPath}'`);
        }
        config.accessLogPath = path.resolve(providedConfig.accessLogPath);
    }
    if ('includeMutations' in providedConfig) {
        if (typeof providedConfig.includeMutations !== 'boolean') {
            croak(`ERROR: includeMutations should be boolean, not ${typeof providedConfig.includeMutations}`);
        }
        config.includeMutations = providedConfig.includeMutations;
    }
    if ('superusers' in providedConfig) {
        if (typeof providedConfig.superusers !== 'object' || Array.isArray(providedConfig.superusers)) {
            croak(`ERROR: superusers, if present, should be an object, not '${JSON.stringify(providedConfig.superusers)}'`);
        }
        for (const suOb of Object.values(providedConfig.superusers)) {
            if (typeof suOb !== 'object' || Array.isArray(suOb)) {
                croak(`ERROR: superuser records should be an object, not '${JSON.stringify(suOb)}'`);
            }
            for (const suKey of Object.keys(suOb)) {
                if (!superuserRecord[suKey]) {
                    croak(`Unknown superuser record option '${suKey}'`);
                }
            }
            if (typeof suOb.password !== 'string') {
                croak(`ERROR: superuser password hash should be a string, not '${JSON.stringify(suOb.password)}'`);
            }
            if (!Array.isArray(suOb.roles)) {
                croak(`ERROR: superuser roles should be an array, not '${JSON.stringify(suOb.roles)}'`);
            }
            if (suOb.roles.length === 0) {
                croak(`ERROR: superuser roles array should not be empty`);
            }
            for (const role of suOb.roles) {
                if (typeof role !== 'string') {
                    croak(`ERROR: superuser role should be a string, not '${JSON.stringify(role)}'`);
                }
                if (!superuserRoles.includes(role)) {
                    croak(`ERROR: superuser role should be one of ${superuserRoles.join(', ')}, not '${role}'`);
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
            croak(`ERROR: sessionTimeoutInMins should be 1, 5, 10, 15, 20 or 30, not '${providedConfig.sessionTimeoutInMins}'`);
        }
        config.sessionTimeoutInMins = providedConfig.sessionTimeoutInMins;
    }
    if ('useCors' in providedConfig) {
        if (typeof providedConfig.useCors !== 'boolean') {
            croak(`ERROR: useCors should be boolean, not ${typeof providedConfig.useCors}`);
        }
        config.useCors = providedConfig.useCors;
    }
    if ('processFrequency' in providedConfig) {
        if (providedConfig.processFrequency !== 'never' && !(providedConfig.processFrequency in cronOptions)) {
            croak(`ERROR: unknown processFrequency option '${providedConfig.processFrequency}' - should be one of never, ${Object.keys(cronOptions).join(', ')}`);
        }
        config.processFrequency = providedConfig.processFrequency;
    }
    if (providedConfig.nWorkers) {
        if (
            typeof providedConfig.nWorkers !== 'number' ||
            providedConfig.nWorkers.toString().includes('.') ||
            providedConfig.nWorkers < 1 ||
            providedConfig.nWorkers > 16) {
            croak(`ERROR: nWorkers should be an integer between 1 and 16, not '${providedConfig.nWorkers}'`);
        }
        config.nWorkers = providedConfig.nWorkers;
    }
    if ('deleteGenerated' in providedConfig) {
        if (typeof providedConfig.deleteGenerated !== 'boolean') {
            croak(`ERROR: deleteGenerated should be boolean, not ${typeof providedConfig.useCors}`);
        }
        config.deleteGenerated = providedConfig.deleteGenerated;
    }
    if ('orgs' in providedConfig) {
        if (!Array.isArray(providedConfig.orgs)) {
            croak(`ERROR: orgs should be an array, not '${providedConfig.orgs}'`);
        }
        config.orgs = providedConfig.orgs;
    }
    if (providedConfig.orgsConfig) {
        if (!Array.isArray(providedConfig.orgsConfig)) {
            croak(`ERROR: orgsConfig, if present, should be an array, not '${providedConfig.orgsConfig}'`);
        }
        config.orgsConfig = [];
        for (const orgConfig of providedConfig.orgsConfig) {
            if (typeof orgConfig !== 'object' || Array.isArray(orgConfig)) {
                croak(`ERROR: each orgsConfig spec should be an object, not '${JSON.stringify(orgConfig)}'`);
            }
            const orgOb = {};
            for (const orgKey of Object.keys(orgConfig)) {
                if (!orgConfigTemplate[orgKey]) {
                    croak(`Unknown orgsConfig spec option '${orgKey}'`);
                }
            }
            if (!orgConfig.name) {
                croak(`ERROR: each orgsConfig spec must have a name`);
            }
            if (!nameRE.test(orgConfig.name)) {
                croak(`ERROR: orgsConfig name '${orgConfig.name}' for ${orgConfig.name} contains illegal characters'`);
            }
            orgOb.name = orgConfig.name;
            if (orgConfig.resourceTypes) {
                if (!Array.isArray(orgConfig.resourceTypes)) {
                    croak(`ERROR: orgsConfig resourceTypes for ${orgConfig.name}, if present, must be an array, not '${orgConfig.resourceTypes}'`);
                }
                for (const resourceType of orgConfig.resourceTypes) {
                    if (typeof resourceType !== "string") {
                        croak(`ERROR: each orgsConfig resourceType element for ${orgConfig.name} should be a string, not '${JSON.stringify(resourceType)}'`);
                    }
                }
                orgOb.resourceTypes = orgConfig.resourceTypes;
            } else {
                orgOb.resourceTypes = [];
            }
            if (orgConfig.resourceFormats) {
                if (!Array.isArray(orgConfig.resourceFormats)) {
                    croak(`ERROR: orgsConfig resourceFormats for ${orgConfig.name}, if present, must be an array, not '${orgConfig.resourceFormats}'`);
                }
                for (const resourceFormat of orgConfig.resourceFormats) {
                    if (typeof resourceFormat !== "string") {
                        croak(`ERROR: each orgsConfig resourceFormat element for ${orgConfig.name} should be a string, not '${JSON.stringify(resourceFormat)}'`);
                    }
                    if (!resourceFormats.includes(resourceFormat)) {
                        croak(`ERROR: each orgsConfig resourceFormat element for ${orgConfig.name} should be one of ${resourceFormats.join(', ')}, not '${JSON.stringify(resourceFormat)}'`);
                    }
                }
                orgOb.resourceFormats = orgConfig.resourceFormats;
            } else {
                orgOb.resourceFormats = [];
            }
            if (orgConfig.languages) {
                if (!Array.isArray(orgConfig.languages)) {
                    croak(`ERROR: orgsConfig languages for ${orgConfig.name}, if present, must be an array, not '${orgConfig.languages}'`);
                }
                for (const language of orgConfig.languages) {
                    if (typeof language !== "string") {
                        croak(`ERROR: each orgsConfig language element for ${orgConfig.name} should be a string, not '${JSON.stringify(language)}'`);
                    }
                }
                orgOb.languages = orgConfig.languages;
            } else {
                orgOb.languages = [];
            }
            if (orgConfig.whitelist) {
                if (!Array.isArray(orgConfig.whitelist)) {
                    croak(`ERROR: orgsConfig whitelist for ${orgConfig.name}, if present, must be an array, not '${orgConfig.whitelist}'`);
                }
                for (const white of orgConfig.whitelist) {
                    if (typeof white !== 'object' || Array.isArray(white)) {
                        croak(`ERROR: orgsConfig whitelist elements for ${orgConfig.name} should be an object, not '${JSON.stringify(white)}'`);
                    }
                    if (Object.keys(white).length === 0) {
                        croak(`ERROR: orgsConfig whitelist elements for ${orgConfig.name} should contain at least one value`);
                    }
                    for (const whiteField of ["owner", "id", "revision"]) {
                        if (white[whiteField] && typeof white[whiteField] !== 'string') {
                            croak(`ERROR: ${whiteField} field in orgsConfig whitelist elements for ${orgConfig.name} must be a string, not '${whiteField}'`);
                        }
                    }
                }
                orgOb.whitelist = orgConfig.whitelist;
            } else {
                orgOb.whitelist = [];
            }
            if (orgConfig.blacklist) {
                if (!Array.isArray(orgConfig.blacklist)) {
                    croak(`ERROR: orgsConfig blacklist for ${orgConfig.name}, if present, must be an array, not '${orgConfig.blacklist}'`);
                }
                for (const black of orgConfig.blacklist) {
                    if (typeof black !== 'object' || Array.isArray(black)) {
                        croak(`ERROR: orgsConfig blacklist elements for ${orgConfig.name} should be an object, not '${JSON.stringify(black)}'`);
                    }
                    if (Object.keys(black).length === 0) {
                        croak(`ERROR: orgsConfig blacklist elements for ${orgConfig.name} should contain at least one value`);
                    }
                    for (const blackField of ["owner", "id", "revision"]) {
                        if (black[blackField] && typeof black[blackField] !== 'string') {
                            croak(`ERROR: ${blackField} field in orgsConfig blacklist elements for ${orgConfig.name} must be a string, not '${blackField}'`);
                        }
                    }
                }
                orgOb.blacklist = orgConfig.blacklist;
            } else {
                orgOb.blacklist = [];
            }
            if (orgConfig.syncFrequency) {
                if (typeof orgConfig.syncFrequency !== 'string') {
                    croak(`ERROR: orgsConfig syncFrequency for ${orgConfig.name}, if present, must be a string, not '${orgConfig.syncFrequency}'`);
                }
                if (orgConfig.syncFrequency !== 'never' && !(orgConfig.syncFrequency in syncCronOptions)) {
                    croak(`ERROR: unknown orgConfig syncFrequency option '${orgConfig.syncFrequency}' for ${orgConfig.name} - should be one of never, ${Object.keys(syncCronOptions).join(', ')}`);
                }
                orgOb.syncFrequency = orgConfig.syncFrequency;
            } else {
                orgOb.syncFrequency = "never";
            }
            if (orgConfig.peerUrl) {
                if (typeof orgConfig.peerUrl !== 'string') {
                    croak(`ERROR: orgsConfig peerUrl for ${orgConfig.name}, if present, must be a string, not '${orgConfig.peerUrl}'`);
                }
                orgOb.peerUrl = orgConfig.peerUrl;
            } else {
                orgOb.peerUrl = null;
            }
            if (orgConfig.etc) {
                if (typeof orgConfig.etc !== 'object' || Array.isArray(orgConfig.etc)) {
                    croak(`ERROR: orgsConfig etc for ${orgConfig.name}, if present, should be an object, not '${JSON.stringify(orgConfig.etc)}'`);
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
            croak(`ERROR: verbose should be boolean, not ${typeof providedConfig.verbose}`);
        }
        config.verbose = providedConfig.verbose;
    }
    if ('localContent' in providedConfig) {
        if (typeof providedConfig.localContent !== 'boolean') {
            croak(`ERROR: localContent should be boolean, not ${typeof providedConfig.localContent}`);
        }
        config.localContent = providedConfig.localContent;
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
    ${config.staticPaths ? `${staticDescription(config.staticPaths)}` : "No static paths"}
    Process new data ${config.processFrequency === 'never' ? "disabled" : `every ${config.processFrequency}
    ${config.nWorkers} worker thread${config.nWorkers === 1 ? "" : "s"}
    ${Object.keys(config.superusers).length} superuser${Object.keys(config.superusers).length === 1 ? "" : "s"}
    ${Object.keys(config.superusers).length === 0 ? "" : `Session cookies expire after ${config.sessionTimeoutInMins} min`}
    ${config.deleteGenerated ? "Delete all generated content" : "Delete lock files only"} on startup
`}`

module.exports = {makeConfig, cronOptions, configSummary};
