const mongo = require("./mongo");
const { Configuration } = require("./mongo");

// Use a separate database for testing.
const dbName = "diegesis_test";
/** @type {Configuration} */
const config = { connection: { dbName } };

describe("MongoDB Connection", () => {
    it("should connect and close", async () => {
        await expect(mongo.connect()).resolves.not.toThrow();
        await expect(mongo.close()).resolves.not.toThrow();
    });
});

describe("MongoDB Methods", () => {
    beforeAll(async () => await mongo.connect(config));
    afterAll(async () => await mongo.close(config));

    it("should throw when organization name is not a string", async () => {
        await expect(mongo.orgEntries(config, undefined)).rejects.toThrow();
        await expect(mongo.orgEntries(config, 1)).rejects.toThrow();
        await expect(mongo.orgEntries(config, [])).rejects.toThrow();
    });

    it("should have organization entries", async () => {
        const entries = await mongo.orgEntries(config, "DBL");
        expect(entries.length).toEqual(3);
        const getOccurrence = (array, value) =>
            array.filter((v) => v === value).length;
        const numbersOfRevisions = entries.map((e) => e.revisions.length);
        // One revisions array should have 2 items.
        expect(getOccurrence(numbersOfRevisions, 2)).toEqual(1);
        // Two revisions arrays should have 1 item.
        expect(getOccurrence(numbersOfRevisions, 1)).toEqual(2);
    });

    it("should check if entry exists and doesn't", async () => {
        expect(
            await mongo.entryExists(config, "DBL", "7142879509583d59", "85")
        ).toBe(true);
        expect(
            await mongo.entryExists(config, "DBL", "7142879509583d59", "1")
        ).toBe(false);
        expect(await mongo.entryExists(config, "DBL", "unknown_id", "85")).toBe(
            false
        );
        expect(
            await mongo.entryExists(config, "unknown", "7142879509583d59", "85")
        ).toBe(false);
    });

    it("should check if entry revision exists and doesn't", async () => {
        expect(
            await mongo.entryRevisionExists(config, "DBL", "7142879509583d59")
        ).toBe(true);
        expect(
            await mongo.entryRevisionExists(config, "DBL", "unknown_id")
        ).toBe(false);
        expect(
            await mongo.entryRevisionExists(
                config,
                "unknown",
                "7142879509583d59"
            )
        ).toBe(false);
    });

    it("should read entry metadata", async () => {
        const source = "DBL";
        const id = "7142879509583d59";
        const revision = "85";
        const entry = await mongo.readEntryMetadata(
            config,
            source,
            id,
            revision
        );
        expect(entry.source).toEqual(source);
        expect(entry.id).toEqual(id);
        expect(entry.revision).toEqual(revision);
        expect(entry.languageCode).toEqual("en");
        expect(entry.title).toEqual("World English Bible British Edition");
        expect(entry.abbreviation).toEqual("engWEBBE");
        expect(entry.owner).toEqual("eBible.org");
    });
});
