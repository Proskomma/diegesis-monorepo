const {makeConfig, configSummary} = require("./lib/makeConfig.js");
const checkCli = require("./lib/checkCli.js");
const makeServer = require("./lib/makeServer.js");

// Build config object
let config;
const providedConfig = checkCli();
config = makeConfig(providedConfig);

// Close server function
const closeServer = (server, signal, verbose) => {
    verbose && console.log(`${signal} signal received: closing Diegesis Server.`);
    server.close((err) => {
        verbose && console.log(`${err ? "Forced": "Normal"} close of Diegesis Server.`);
        process.exit(err ? 1 : 0);
    });
}

// Start listening
makeServer(config).then(app => {
    let appServer = app.listen(config.port, config.hostName,() => {
        process.on('SIGTERM', () => {
            closeServer(appServer, 'SIGTERM', config.verbose);
        });
        process.on('SIGINT', () => {
            closeServer(appServer, 'SIGINT', config.verbose);
        });
        config.verbose && console.log(configSummary(config));
    })
});
