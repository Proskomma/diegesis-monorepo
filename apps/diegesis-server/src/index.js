const {makeConfig, configSummary} = require("./lib/makeConfig.js");
const checkCli = require("./lib/checkCli.js");
const makeServer = require("./lib/makeServer.js");

// Build config object
let config;
const providedConfig = checkCli();
config = makeConfig(providedConfig);

// Start listening
makeServer(config).then(app => {
    let appServer = app.listen(config.port, config.hostName,() => {
        process.on('SIGTERM', () => {
            console.info('SIGTERM signal received.');
            console.log('Closing Diegesis Server.');
            appServer.close((err) => {
                console.log(`${err ? "Forced": "Normal"} close of Diegesis Server.`);
                process.exit(err ? 1 : 0);
            });
        });
        config.verbose && console.log(configSummary(config));
    })
});
