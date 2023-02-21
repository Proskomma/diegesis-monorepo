const mongo = require("../mongo");

/**
 * Test MongoDB connections and actions
 * @returns {string}
 */
async function main() {
    await mongo.connect();
    return "Done.";
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => mongo.close());
