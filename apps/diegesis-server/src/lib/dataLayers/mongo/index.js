const { MongoClient, MongoClientOptions } = require("mongodb");
const { checkResourceOrigin } = require("../utils");

// Connection URL
const url = "mongodb://localhost:27017";
/** @type {MongoClient} */
let client;

// Database Name
const dbName = "diegesis";

// Connection

/**
 * @typedef {object} Configuration
 * @property {boolean} [debug] - Enables Apollo sandbox, some convenience HTML endpoints, and stack traces in GraphQL errors
 * @property {object} [connection] - data persistence connection configuration
 * @property {MongoClientOptions} [connection.options] - Describes all possible URI query options for the mongo client
 * @property {boolean} [connection.force] - Force close, emitting no events
 */

/**
 * Connect to the MongoDB server
 * @param {Configuration} [config] - configuration options
 */
const connect = async (config) => {
    if (!client) {
        client = new MongoClient(url, config?.connection?.options);
    }
    await client.connect();
    if (config?.debug) {
        console.log("Connected successfully to MongoDB server");
    }
};

/**
 * Close the MongoDB connection
 * @param {Configuration} [config] - configuration options
 */
const close = async (config) => {
    await client?.close(config?.connection?.force);
    client = undefined;
    if (config?.debug) {
        console.log("Connection closed to MongoDB server");
    }
};

// Orgs

const orgExists = (config, orgName) => {
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in orgExists");
    }
    return false;
};

const initializeOrg = (config, orgName) => {
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in initializeOrg");
    }
};

// Entries

const initializeEmptyEntry = (config, orgName, transId, transRevision) => {
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in initializeEmptyEntry");
    }
};

const orgEntries = (config, orgName) => {
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in orgEntries");
    }
    return [];
};

const deleteEntry = (config, orgName, transId, transRevision) => {
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in deleteEntry");
    }
};

const deleteGeneratedEntryContent = (
    config,
    orgName,
    transId,
    transRevision
) => {
    if (!(typeof orgName === "string")) {
        throw new Error(
            "orgName should be string in deleteGeneratedEntryContent"
        );
    }
};

const _entryResources = (
    config,
    orgName,
    transId,
    transRevision,
    resourceOrigin
) => {
    return [];
};

const originalEntryResources = (config, orgName, transId, transRevision) => {
    return _entryResources(config, orgName, transId, transRevision, "original");
};

const generatedEntryResources = (config, orgName, transId, transRevision) => {
    return _entryResources(
        config,
        orgName,
        transId,
        transRevision,
        "generated"
    );
};
const entryResources = (config, orgName, transId, transRevision) => {
    return [
        ...originalEntryResources(config, orgName, transId, transRevision),
        ...generatedEntryResources(config, orgName, transId, transRevision),
    ];
};

const initializeEntryBookResourceCategory = (
    config,
    orgName,
    transId,
    transRevision,
    resourceOrigin,
    resourceCategory
) => {
    if (!(typeof orgName === "string")) {
        throw new Error(
            "orgName should be string in initializeEntryBookResourceCategory"
        );
    }
    checkResourceOrigin();
};

const entryBookResourcesForCategory = (
    config,
    orgName,
    transId,
    transRevision,
    bookResourceCategory
) => {
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in entryBookResources");
    }
    return [];
};

const _entryBookResourcesForBook = (
    config,
    orgName,
    transId,
    transRevision,
    resourceOrigin,
    bookCode
) => {
    return [];
};

const originalEntryBookResourcesForBook = (
    config,
    orgName,
    transId,
    transRevision,
    bookCode
) => {
    return _entryBookResourcesForBook(
        config,
        orgName,
        transId,
        transRevision,
        "original",
        bookCode
    );
};

const generatedEntryBookResourcesForBook = (
    config,
    orgName,
    transId,
    transRevision,
    bookCode
) => {
    return _entryBookResourcesForBook(
        config,
        orgName,
        transId,
        transRevision,
        "generated",
        bookCode
    );
};

const entryBookResourcesForBook = (
    config,
    orgName,
    transId,
    transRevision,
    bookCode
) => {
    return [
        ...originalEntryBookResourcesForBook(
            config,
            orgName,
            transId,
            transRevision,
            bookCode
        ),
        ...generatedEntryBookResourcesForBook(
            config,
            orgName,
            transId,
            transRevision,
            bookCode
        ),
    ];
};

const _entryBookResourceBookCodes = (
    config,
    orgName,
    transId,
    transRevision,
    resourceOrigin
) => {
    return [];
};

const originalEntryBookResourceBookCodes = (
    config,
    orgName,
    transId,
    transRevision
) => {
    return _entryBookResourceBookCodes(
        config,
        orgName,
        transId,
        transRevision,
        "original"
    );
};

const generatedEntryBookResourceBookCodes = (
    config,
    orgName,
    transId,
    transRevision
) => {
    return _entryBookResourceBookCodes(
        config,
        orgName,
        transId,
        transRevision,
        "generated"
    );
};

const entryBookResourceBookCodes = (
    config,
    orgName,
    transId,
    transRevision
) => {
    return Array.from(
        new Set([
            ...originalEntryBookResourceBookCodes(
                config,
                orgName,
                transId,
                transRevision
            ),
            ...generatedEntryBookResourceBookCodes(
                config,
                orgName,
                transId,
                transRevision
            ),
        ])
    );
};

const _entryBookResourceBookCodesForCategory = (
    config,
    orgName,
    transId,
    transRevision,
    resourceOrigin,
    category
) => {
    return [];
};

const originalEntryBookResourceBookCodesForCategory = (
    config,
    orgName,
    transId,
    transRevision,
    category
) => {
    return _entryBookResourceBookCodesForCategory(
        config,
        orgName,
        transId,
        transRevision,
        "original",
        category
    );
};

const generatedEntryBookResourceBookCodesForCategory = (
    config,
    orgName,
    transId,
    transRevision,
    category
) => {
    return _entryBookResourceBookCodesForCategory(
        config,
        orgName,
        transId,
        transRevision,
        "generated",
        category
    );
};

const entryBookResourceBookCodesForCategory = (
    config,
    orgName,
    transId,
    transRevision,
    category
) => {
    return Array.from(
        new Set([
            ...originalEntryBookResourceBookCodesForCategory(
                config,
                orgName,
                transId,
                transRevision,
                category
            ),
            ...generatedEntryBookResourceBookCodesForCategory(
                config,
                orgName,
                transId,
                transRevision,
                category
            ),
        ])
    );
};

const _entryBookResourceCategories = (
    config,
    orgName,
    transId,
    transRevision,
    resourceOrigin
) => {
    return [];
};

const originalEntryBookResourceCategories = (
    config,
    orgName,
    transId,
    transRevision
) => {
    return _entryBookResourceCategories(
        config,
        orgName,
        transId,
        transRevision,
        "original"
    );
};

const generatedEntryBookResourceCategories = (
    config,
    orgName,
    transId,
    transRevision
) => {
    return _entryBookResourceCategories(
        config,
        orgName,
        transId,
        transRevision,
        "generated"
    );
};

const entryBookResourceCategories = (
    config,
    orgName,
    transId,
    transRevision
) => {
    return Array.from(
        new Set([
            ...originalEntryBookResourceCategories(
                config,
                orgName,
                transId,
                transRevision
            ),
            ...generatedEntryBookResourceCategories(
                config,
                orgName,
                transId,
                transRevision
            ),
        ])
    );
};

// Entry Tests

const entryExists = (config, orgName, transId, transRevision) => {
    return false;
};

const entryRevisionExists = (config, orgName, transId) => {
    return false;
};

const entryIsLocked = (config, orgName, transId, transRevision) => {
    return true;
};

const entryHasSuccinctError = (config, orgName, transId, transRevision) => {
    return false;
};

const entryHasGeneratedContent = (config, orgName, transId, transRevision) => {
    return false;
};

const entryHasOriginal = (
    config,
    orgName,
    transId,
    transRevision,
    contentType
) => {
    return false;
};

const entryHasGenerated = (
    config,
    orgName,
    transId,
    transRevision,
    contentType
) => {
    return false;
};

const entryHas = (config, orgName, transId, transRevision, contentType) => {
    return (
        entryHasOriginal(
            config,
            orgName,
            transId,
            transRevision,
            contentType
        ) ||
        entryHasGenerated(config, orgName, transId, transRevision, contentType)
    );
};

const entryHasOriginalBookResourceCategory = (
    config,
    orgName,
    transId,
    transRevision,
    contentType
) => {
    return false;
};

const entryHasGeneratedBookResourceCategory = (
    config,
    orgName,
    transId,
    transRevision,
    contentType
) => {
    return false;
};

const entryHasBookSourceCategory = (
    config,
    orgName,
    transId,
    transRevision,
    contentType
) => {
    return (
        entryHasOriginalBookResourceCategory(
            config,
            orgName,
            transId,
            transRevision,
            contentType
        ) ||
        entryHasGeneratedBookResourceCategory(
            config,
            orgName,
            transId,
            transRevision,
            contentType
        )
    );
};

// Lock/Unlock

const lockEntry = (config, orgName, transId, transRevision, lockMsg) => {
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in lockEntry");
    }
};

const unlockEntry = (config, orgName, transId, transRevision) => {
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in unlockEntry");
    }
};

// Succinct error

const writeSuccinctError = (
    config,
    orgName,
    transId,
    transRevision,
    succinctErrorJson
) => {};

const deleteSuccinctError = (config, orgName, transId, transRevision) => {};

// Read

const readEntryMetadata = (config, orgName, transId, transRevision) => {
    // Returns JSON
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in readEntryMetadataJson");
    }
    return {};
};

const readEntryResource = (
    config,
    orgName,
    transId,
    transRevision,
    resourceName
) => {
    // Returns JSON or a string depending on resourceName suffix
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in readEntryResource");
    }
    return {};
};

const readEntryBookResource = (
    config,
    orgName,
    transId,
    transRevision,
    resourceCategory,
    resourceName
) => {
    // Returns JSON or a string depending on resourceName suffix
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in readEntryBookResource");
    }
    return {};
};

// Write

const writeEntryBookResource = (
    config,
    orgName,
    transId,
    transRevision,
    resourceCategory,
    resourceName,
    rawContent
) => {
    // Convert JSON to string before writing according to resourceName suffix
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in writeEntryBookResource");
    }
};

const writeEntryMetadata = (
    config,
    orgName,
    transId,
    transRevision,
    contentJson
) => {
    // Expect and write JSON
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in writeEntryMetadataJson");
    }
};

const writeEntryResource = (
    config,
    orgName,
    transId,
    transRevision,
    resourceOrigin,
    resourceName,
    rawContent
) => {
    // Convert JSON to string before writing according to resourceName suffix
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in writeEntryResource");
    }
};

module.exports = {
    connect,
    close,
    initializeOrg,
    orgExists,
    orgEntries,
    initializeEmptyEntry,
    deleteEntry,
    deleteGeneratedEntryContent,
    initializeEntryBookResourceCategory,
    entryBookResourcesForCategory,
    lockEntry,
    unlockEntry,
    readEntryMetadata,
    writeEntryMetadata,
    readEntryResource,
    writeEntryResource,
    readEntryBookResource,
    writeEntryBookResource,
    entryIsLocked,
    entryHasSuccinctError,
    entryHasGeneratedContent,
    entryHas,
    entryHasOriginal,
    entryHasGenerated,
    writeSuccinctError,
    deleteSuccinctError,
    entryExists,
    entryRevisionExists,
    entryHasBookSourceCategory,
    entryHasOriginalBookResourceCategory,
    entryHasGeneratedBookResourceCategory,
    originalEntryResources,
    generatedEntryResources,
    entryResources,
    originalEntryBookResourcesForBook,
    generatedEntryBookResourcesForBook,
    entryBookResourcesForBook,
    originalEntryBookResourceBookCodes,
    generatedEntryBookResourceBookCodes,
    entryBookResourceBookCodes,
    originalEntryBookResourceBookCodesForCategory,
    generatedEntryBookResourceBookCodesForCategory,
    entryBookResourceBookCodesForCategory,
    originalEntryBookResourceCategories,
    generatedEntryBookResourceCategories,
    entryBookResourceCategories,
};
