const { MongoClient, MongoClientOptions } = require("mongodb");
const { checkResourceOrigin, NotImplementedError } = require("../utils");

// Connection URL - don't use localhost - see https://stackoverflow.com/a/70517348.
const defaultUrl = "mongodb://0.0.0.0:27017";
// Default database Name
const defaultDbName = "diegesis";

/** @type {MongoClient} */
let client;

// Connection

/**
 * @typedef {object} Configuration
 * @property {boolean} [verbose] - Enables output of startup information
 * @property {object} [connection] - Data persistence connection configuration
 * @property {string} [connection.url] - MongoDB connection URL
 * @property {MongoClientOptions} [connection.options] - Describes all possible URI query options for the mongo client
 * @property {boolean} [connection.force] - Force close, emitting no events
 * @property {string} [connection.dbName] - Database name
 */

/**
 * Connect to the MongoDB server.
 * @param {Configuration} [config] - configuration options
 */
const connect = async (config) => {
    if (!client) {
        const url = config?.connection?.url ?? defaultUrl;
        client = new MongoClient(url, config?.connection?.options);
    }
    await client.connect();
    if (config?.verbose) {
        console.log("Connected successfully to MongoDB server");
    }
};

/**
 * Close the MongoDB connection.
 * @param {Configuration} [config] - configuration options
 */
const close = async (config) => {
    await client?.close(config?.connection?.force);
    client = undefined;
    if (config?.verbose) {
        console.log("Connection closed to MongoDB server");
    }
};

// Orgs

/**
 * Check if the organization exists.
 * @param {*} _config - unused
 * @param {*} _orgName - unused
 * @returns true - Always returns true since `initializeOrg` is not needed
 */
const orgExists = (_config, _orgName) => true;

/**
 * No implementation required in MongoDB data layer - collections and documents are created on demand.
 * @param {*} _config - unused
 * @param {*} _orgName - unused
 */
const initializeOrg = (_config, _orgName) => {};

// Entries

/**
 * No implementation required in MongoDB data layer - collections and documents are created on demand.
 * @param {*} _config - unused
 * @param {*} _orgName - unused
 * @param {*} _transId - unused
 * @param {*} _transRevision - unused
 */
const initializeEmptyEntry = (
    _config,
    _orgName,
    _transId,
    _transRevision
) => {};

/**
 * Get the entries for a given organization.
 * @param {Configuration} config - configuration options
 * @param {string} orgName Organization name
 * @returns [{ id: '7142879509583d59', revisions: [ '85' ] }, ... ]
 */
const orgEntries = async (config, orgName) => {
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in orgEntries");
    }
    const entries = await _getMetadataCollection(config)
        .aggregate([
            // Find all records with `source` field set to orgName.
            {
                $match: {
                    source: orgName,
                },
            },
            // Sort ascending by id then revision.
            {
                $sort: {
                    id: 1,
                    revision: 1,
                },
            },
            // Accumulate the revisions for the same `id` field.
            {
                $group: {
                    _id: "$id",
                    _revisions: {
                        $addToSet: "$revision",
                    },
                },
            },
            // Add the `id` field (which $group has placed in the `_id` field)
            // to the result but with a temporary name.
            {
                $addFields: {
                    transId: "$_id",
                },
            },
            // Output the fields with the right names - remove the duplicated
            // `_id` field.
            {
                $project: {
                    _id: 0,
                    id: "$transId",
                    revisions: "$_revisions",
                },
            },
        ])
        .toArray();
    return entries;
};

const deleteEntry = (config, orgName, transId, transRevision) => {
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in deleteEntry");
    }
    throw new NotImplementedError();
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
    throw new NotImplementedError();
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

/**
 * Check if entry exists.
 * @param {Configuration} config
 * @param {string} orgName
 * @param {string} transId
 * @param {string} transRevision
 * @returns true if entry exists, false otherwise
 */
const entryExists = async (config, orgName, transId, transRevision) => {
    const entry = await readEntryMetadata(
        config,
        orgName,
        transId,
        transRevision
    );
    return !!entry;
};

/**
 * Check if entry revision exists.
 * @param {Configuration} config
 * @param {string} orgName
 * @param {string} transId
 * @returns true if entry exists, false otherwise
 */
const entryRevisionExists = async (config, orgName, transId) => {
    const metadata = _getMetadataCollection(config);
    const entry = await metadata.findOne({
        source: orgName,
        id: transId,
    });
    return !!entry;
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

/**
 * Get the entry Metadata.
 * @param {Configuration} config
 * @param {string} orgName
 * @param {string} transId
 * @param {string} transRevision
 * @returns Metadata JSON
 */
const readEntryMetadata = async (config, orgName, transId, transRevision) => {
    if (!(typeof orgName === "string")) {
        throw new Error("orgName should be string in readEntryMetadata");
    }
    const metadata = _getMetadataCollection(config);
    const entry = await metadata.findOne({
        source: orgName,
        id: transId,
        revision: transRevision,
    });
    return entry;
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

/**
 * Get the MongoDB database.
 * @param {Configuration} config
 * @returns a MongoDB database
 */
const _getDb = (config) => {
    const dbName = config?.connection?.dbName ?? defaultDbName;
    const db = client.db(dbName);
    return db;
};

/**
 * Get the MongoDB metadata collection.
 * @param {Configuration} config
 * @returns a MongoDB collection
 */
const _getMetadataCollection = (config) => {
    const db = _getDb(config);
    const resources = db.collection("metadata");
    return resources;
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
