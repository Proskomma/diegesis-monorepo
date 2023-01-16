const shajs = require('sha.js');
const path = require("path");
const fse = require('fs-extra');

const knownRoles = {
    admin: true,
    archivist: true
};

if (process.argv.length < 5) {
    console.log("Too few arguments");
    console.log("USAGE: node add_admin_user.js <configPath> <username> <password> [<role> <role> ...]");
    process.exit(1);
}

const configPath = path.resolve(process.argv[2]);
const userName = process.argv[3];
const password = process.argv[4];
const roles = process.argv.slice(5);
for (const role of roles) {
    if (!knownRoles[role]) {
        console.log(`Role '${role}' is not one of ${Object.keys(knownRoles).map(r => `'${r}'`).join(', ')}`);
        console.log("USAGE: node add_admin_user.js <configPath> <username> <password> [<role> <role> ...]");
        process.exit(1);
    }
}
let config;
try {
    config = fse.readJsonSync(configPath);
} catch (err) {
    console.log(`Could not load config file '${configPath}'`);
    process.exit(1);
}
const hash = shajs('sha256').update(`${userName}${password}`).digest('hex');
if (!config.superusers) {
    config.superusers = {};
}
config.superusers[userName] = {
    password: hash,
    roles
};
fse.writeFileSync(configPath, JSON.stringify(config, null, 2));
