const cron = require("node-cron");
const path = require("path");
const fse = require('fs-extra');
const {Worker} = require('node:worker_threads');
const {cronOptions} = require("./makeConfig.js");
const {randomInt} = require("node:crypto");

function doSessionCron(app, frequency) {
    cron.schedule(
        cronOptions[frequency],
        () => {
            app.authSalts[0] = app.authSalts[1];
            app.authSalts[1] = shajs('sha256').update(randomInt(1000000, 9999999).toString()).digest('hex');
        }
    )
}

function doRenderCron(config) {
    cron.schedule(
        cronOptions[config.processFrequency],
        () => {
            let nLocked = 0;
            let taskSpecs = [];
            try {
                for (const orgDir of fse.readdirSync(path.resolve(config.dataPath))) {
                    const transDir = path.resolve(config.dataPath, orgDir);
                    if (fse.pathExistsSync(transDir) && fse.lstatSync(transDir).isDirectory()) {
                        for (const translationId of fse.readdirSync(transDir)) {
                            for (const revision of fse.readdirSync(path.join(transDir, translationId))) {
                                if (fse.pathExistsSync(path.join(transDir, translationId, revision, 'succinctError.json'))) {
                                    continue;
                                }
                                if (fse.pathExistsSync(path.join(transDir, translationId, revision, 'lock.json'))) {
                                    nLocked++;
                                    continue;
                                }
                                if (!fse.pathExistsSync(path.join(transDir, translationId, revision, 'generated'))) {
                                    if (fse.pathExistsSync(path.join(transDir, translationId, revision, 'original', 'succinct.json'))) {
                                        taskSpecs.push([orgDir, translationId, revision, 'succinct']);
                                    }
                                    if (fse.pathExistsSync(path.join(transDir, translationId, revision, 'original', 'usfmBooks'))) {
                                        taskSpecs.push([orgDir, translationId, revision, 'usfm']);
                                    }
                                    if (fse.pathExistsSync(path.join(transDir, translationId, revision, 'original', 'usxBooks'))) {
                                        taskSpecs.push([orgDir, translationId, revision, 'usx']);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                const succinctError = {
                    generatedBy: 'cron',
                    context: {},
                    message: err.message
                };
                config.incidentLogger.error(succinctError);
                return;
            }
            try {
                for (
                    const taskSpec of taskSpecs
                    .map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value)
                    .slice(0, Math.max(config.nWorkers - nLocked, 0))
                    ) {
                    if (config.verbose) {
                        config.incidentLogger.info({
                            context: {running: "cronTask"},
                            taskSpec
                        });
                    }
                    const worker = new Worker('./src/lib/makeDownloads.js');
                    worker.on('message', e => config.incidentLogger.info(e));
                    worker.on('error', e => config.incidentLogger.error(e));
                    const [orgDir, transId, revision, contentType] = taskSpec;
                    worker.postMessage({dataPath: config.dataPath, orgDir, transId, revision, contentType});
                }
            } catch (err) {
                console.log("makeDownload worker", err.message);
            }
        }
    );
}

module.exports = {doRenderCron, doSessionCron};
