const {randomInt} = require("node:crypto");
const {doSessionCron} = require("./cron.js");
const fse = require('fs-extra');
const path = require("path");
const shajs = require('sha.js');

const appRoot = path.resolve(".");

const processSession = function (session, superusers, authSalts) {
    const failJson = {authenticated: false, msg: "Could not authenticate (bad session?)"};
    if (!session) {
        return ({authenticated: false, msg: "Please include session!"});
    } else {
        // Get username and server-side hash for that user
        const username = session.split('-')[0];
        const superPass = superusers[username];
        if (!superPass) {
            return failJson;
        } else {
            let matched = false;
            for (const salt of authSalts) {
                // Make sessionCode for this user using the server-side hash and salt
                const session2 = `${username}-${shajs('sha256')
                    .update(`${superPass}-${salt}`)
                    .digest('hex')}`;
                // Compare this new sessionCode with the one the client provided
                if (session2 === session) {
                    matched = true;
                    break;
                }
            }
            if (matched) {
                return ({authenticated: true, msg: "Success"});
            } else {
                return failJson;
            }
        }
    }
}

function makeServerAuth(app, config) {
    app.superusers = config.superusers;
    if (Object.keys(app.superusers).length > 0) {
        app.sessionTimeoutInMins = config.sessionTimeoutInMins;
        app.authSalts = [shajs('sha256')
            .update(randomInt(1000000, 9999999).toString())
            .digest('hex')];
        app.authSalts.push(app.authSalts[0]);  // Start with 2 identical salts

        doSessionCron(app, `${config.sessionTimeoutInMins} min`);

        app.get('/login', (req, res) => {
            const payload = fse.readFileSync(
                path.resolve(appRoot, 'src', 'html', 'login.html')
            ).toString()
                .replace('%redirect%', req.query.redirect || '/');
            res.send(payload);
        });

        app.post('/new-login-auth', function (request, response) {
            const failMsg = "Could not authenticate (bad username/password?)";
            let username = request.body.username;
            let password = request.body.password;
            if (!username || !password) {
                response.send('Please include username and password!');
            } else {
                const superPass = app.superusers[username];
                if (!superPass) {
                    response.send(failMsg);
                } else {
                    const hash = shajs('sha256')
                        .update(`${username}${password}`)
                        .digest('hex');
                    if (hash !== superPass) {
                        response.send(failMsg);
                    } else {
                        const sessionCode =
                            `${username}-${shajs('sha256')
                                .update(`${hash}-${app.authSalts[app.authSalts.length - 1]}`)
                                .digest('hex')}`;
                        response.cookie(
                            'diegesis-auth',
                            sessionCode,
                            {
                                expires: new Date(new Date().getTime() + app.sessionTimeoutInMins * 60 * 1000)
                            }
                        );
                        response.redirect(request.body.redirect || '/');
                    }
                }
            }
        });

        app.post('/session-auth', function (req, res) {
            res.send(processSession(req.body.session, app.superusers, app.authSalts));
        });
    }
}

module.exports = {makeServerAuth, processSession};
