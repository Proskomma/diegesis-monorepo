const path = require("path");
const fse = require('fs-extra');
const express = require("express");
const helmet = require("helmet");
const {ApolloServer} = require("apollo-server-express");
const {mergeTypeDefs} = require('@graphql-tools/merge')
const morgan = require('morgan');
const winston = require('winston');
const shajs = require('sha.js');
const cookieParser = require('cookie-parser');
const makeResolvers = require("../graphql/resolvers/index.js");
const {scalarSchema, querySchema, mutationSchema} = require("../graphql/schema/index.js");
const doCron = require("./cron.js");

const appRoot = path.resolve(".");

async function makeServer(config) {
    // Express
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(helmet({
        crossOriginEmbedderPolicy: !config.debug,
        contentSecurityPolicy: !config.debug,
    }));
    app.use(cookieParser());
    if (config.useCors) {
        app.all('*', (req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, PATCH, OPTIONS');
            res.header('Access-Control-Allow-Headers', '*');
            res.header('Access-Control-Allow-Credentials', true);
            next();
        });
    }
    // Maybe static, each with optional 'to root' redirects
    if (config.staticPaths) {
        for (const staticPathSpec of config.staticPaths) {
            app.use(staticPathSpec.url, express.static(staticPathSpec.path));
            for (const redirect of staticPathSpec.redirects) {
                app.get(redirect, (req, res) => {
                    res.sendFile(staticPathSpec.redirectTarget, function (err) {
                        if (err) {
                            res.status(500).send(err)
                        }
                    })
                });
            }
        }
    }

    // Maybe copy local translations
    if (config.localUsxPath) {
        const targetDir = path.join(config.dataPath, 'localusx');
        if (fse.pathExistsSync(targetDir)) {
            fse.removeSync(targetDir);
        }
        fse.copySync(config.localUsxPath, targetDir);
    }

    // Maybe HTML endpoints
    if (config.debug) {
        // Hello world index
        app.get('/', (req, res) => {
            res.sendFile(path.resolve(appRoot, 'src', 'html', 'index.xhtml'));
        });

        // DIY GraphQL form
        app.get('/gql_form', (req, res) => {
            res.sendFile(path.resolve(appRoot, 'src', 'html', 'gql_form.xhtml'));
        });
    }

    // Login
    app.superusers = config.superusers;

    app.get('/login', (req, res) => {
        res.sendFile(path.resolve(appRoot, 'src', 'html', 'login.html'));
    });

    app.post('/auth', function(request, response) {
        const failMsg = "Could not authenticate (bad username/password?)";
        let username = request.body.username;
        let password = request.body.password;
        if (!username || !password) {
            response.send('Please enter Username and Password!');
        } else {
            const superPass = app.superusers[username];
            if (!superPass) {
                response.send(failMsg);
            } else {
                const hash = shajs('sha256').update(`${username}${password}`).digest('hex');
                if (hash !== superPass) {
                    response.send(failMsg);
                } else {
                    response.cookie('diegesis-auth', shajs('sha256').update(hash).digest('hex'))
                    response.redirect('/admin');
                }
            }
        }
    });

    // Maybe log access using Morgan
    if (config.logAccess) {
        if (config.accessLogPath) {
            const accessLogStream = fse.createWriteStream(config.accessLogPath, {flags: 'a'});
            app.use(
                morgan(
                    config.logFormat,
                    {stream: accessLogStream}
                )
            );
        } else {
            app.use(
                morgan(config.logFormat)
            );
        }
    }

    // Log incidents using Winston
    config.incidentLogger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [new winston.transports.Console()],
    });

    // Delete lock files and maybe generated files and directories
    for (const org of fse.readdirSync(config.dataPath)) {
        const orgDir = path.join(config.dataPath, org);
        if (fse.pathExistsSync(orgDir) && fse.lstatSync(orgDir).isDirectory()) {
            for (const trans of fse.readdirSync(orgDir)) {
                const transDir = path.join(orgDir, trans);
                for (const revision of fse.readdirSync(transDir)) {
                    const revisionDir = path.join(transDir, revision);
                    for (const toRemove of (config.deleteGenerated ? ["succinct.json", "succinctError.json", "lock.json", "sofriaBooks", "perfBooks"] : ["lock.json"])) {
                        fse.remove(path.join(revisionDir, toRemove));
                    }
                }
            }
        }
    }

    // Apollo server
    const resolvers = await makeResolvers(config);
    const server = new ApolloServer({
        typeDefs: mergeTypeDefs(
            config.includeMutations ?
                [scalarSchema, querySchema, mutationSchema] :
                [scalarSchema, querySchema]
        ),
        resolvers,
        debug: config.debug,
    });

    // Maybe start cron
    if (config.cronFrequency !== 'never') {
        doCron(config);
    }

    // Start server
    await server.start();
    server.applyMiddleware({app});
    return app;
}

module.exports = makeServer;
