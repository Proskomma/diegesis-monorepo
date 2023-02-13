const {ApolloServer} = require("@apollo/server");
const { expressMiddleware } = require('@apollo/server/express4');
const {mergeTypeDefs} = require('@graphql-tools/merge')
const makeResolvers = require("../graphql/resolvers/index.js");
const {scalarSchema, querySchema, mutationSchema} = require("../graphql/schema/index.js");
const {doRenderCron} = require("./cron.js");
const makeServerApp = require('./makeServerHelpers/makeServerApp');
const {makeServerAuth, processSession} = require('./makeServerHelpers/makeServerAuth');
const makeServerOrgs = require('./makeServerHelpers/makeServerOrgs');
const makeServerStatic = require('./makeServerHelpers/makeServerStatic');
const makeServerLogging = require('./makeServerHelpers/makeServerLogging');
const makeServerDelete = require('./makeServerHelpers/makeServerDelete');

async function makeServer(config) {

    config.verbose && console.log("Diegesis Server");

    // Express
    const app = makeServerApp(config);

    // Log incidents using Winston; Maybe log access using Morgan
    makeServerLogging(app, config);

    // Maybe static, each with optional 'to root' redirects
    makeServerStatic(app, config);

    // Set up auth if configured
    makeServerAuth(app, config);

    // Delete lock files and maybe generated files and directories
    makeServerDelete(config);

    // Set up orgs
    const {orgsData, orgHandlers} = await makeServerOrgs(config);

    // Maybe start processing cron
    if (config.processFrequency !== 'never') {
        doRenderCron(config);
    }

    // Make apollo server
    const resolvers = await makeResolvers(orgsData, orgHandlers, config);
    const server = new ApolloServer({
        typeDefs: mergeTypeDefs(
            config.includeMutations ?
                [scalarSchema, querySchema, mutationSchema] :
                [scalarSchema, querySchema]
        ),
        resolvers,
        includeStacktraceInErrorResponses: config.debug,
    });

    // Start apollo server with app as middleware
    await server.start();

    // migration to apollo 4. Equivalent to the old "server.applyMiddleware({app})"
    app.use(
        expressMiddleware(server, {
            context: ({req}) => {
                return {
                    auth: !req.cookies || !req.cookies["diegesis-auth"] ?
                        {authenticated: false, msg: "No auth cookie"} :
                        processSession(req.cookies["diegesis-auth"], app.superusers, app.authSalts)
                };
            },
        }),
    );
    return app;
}

module.exports = makeServer;
