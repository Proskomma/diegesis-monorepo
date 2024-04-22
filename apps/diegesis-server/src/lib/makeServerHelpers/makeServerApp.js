const express = require("express");
const helmet = require("helmet");
const path = require("path");
const cookieParser = require('cookie-parser');

const appRoot = path.resolve(".");

function makeServerApp(config) {
    const app = express();
    app.use(express.json({limit: "500mb"}));
    app.use(express.urlencoded({limit: "500mb", extended: true}));
    app.use(helmet({
        crossOriginEmbedderPolicy: config.debug,
        contentSecurityPolicy: config.debug,
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

    if (config.debug) {
        // DIY GraphQL form
        app.get('/gql_form', (req, res) => {
            res.sendFile(path.resolve(appRoot, 'src', 'html', 'gql_form.xhtml'));
        });
    }
    return app;
}

module.exports = makeServerApp;
