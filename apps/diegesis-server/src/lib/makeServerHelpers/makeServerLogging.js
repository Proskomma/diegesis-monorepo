const fse = require('fs-extra');
const morgan = require('morgan');
const winston = require('winston');

function makeServerLogging(app, config) {
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
    config.incidentLogger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [new winston.transports.Console()],
    });
}

module.exports = makeServerLogging;
