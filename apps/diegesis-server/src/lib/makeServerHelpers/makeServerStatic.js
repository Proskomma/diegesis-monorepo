function makeServerStatic(app, config) {
    const express = require("express");
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
}

module.exports = makeServerStatic;
