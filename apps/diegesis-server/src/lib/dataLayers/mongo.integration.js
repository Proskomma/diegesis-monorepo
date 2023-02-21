const mongo = require("./mongo");

describe("MongoDB", () => {
    it("should connect and close", async () => {
        await expect(mongo.connect()).resolves.not.toThrow();
        await expect(mongo.close()).resolves.not.toThrow();
    });
});
