const path = require("path");

const orgPath =
    (dataPath, translationDir) => {
        return path.resolve(
            dataPath,
            translationDir,
        );
    }

const transPath =
    (dataPath, translationDir, translationId, translationRevision, extra) => {
        if (!translationRevision || extra) {
            throw new Error("transPath requires 4 args");
        }
        return path.resolve(
            dataPath,
            translationDir,
            translationId,
            translationRevision
        );
    }

const transParentPath =
    (dataPath, translationDir, translationId, extra) => {
        if (!translationId || extra) {
            throw new Error("transParentPath requires 3 args");
        }
        return path.resolve(
            dataPath,
            translationDir,
            translationId
        );
    }

const usfmDir =
    (dataPath, translationDir, translationId, translationRevision, extra) => {
        if (!translationRevision || extra) {
            throw new Error("usfmDir requires 4 args");
        }
       return path.join(
            transPath(dataPath, translationDir, translationId, translationRevision),
            'usfmBooks'
        );
    }

const usxDir =
    (dataPath, translationDir, translationId, translationRevision, extra) => {
        if (!translationRevision || extra) {
            throw new Error("usxDir requires 4 args");
        }
        return path.join(
            transPath(dataPath, translationDir, translationId, translationRevision),
            'usxBooks'
        );
    }

const perfDir =
    (dataPath, translationDir, translationId, translationRevision, extra) => {
        if (!translationRevision || extra) {
            throw new Error("perfDir requires 4 args");
        }
        return path.join(
            transPath(dataPath, translationDir, translationId, translationRevision),
            'perfBooks'
        );
    }

const simplePerfDir =
    (dataPath, translationDir, translationId, translationRevision, extra) => {
        if (!translationRevision || extra) {
            throw new Error("simplePerfDir requires 4 args");
        }
        return path.join(
            transPath(dataPath, translationDir, translationId, translationRevision),
            'simplePerfBooks'
        );
    }

const sofriaDir =
    (dataPath, translationDir, translationId, translationRevision, extra) => {
        if (!translationRevision || extra) {
            throw new Error("sofriaDir requires 4 args");
        }
        return path.join(
            transPath(dataPath, translationDir, translationId, translationRevision),
            'sofriaBooks'
        );
    }

const succinctPath =
    (dataPath, translationDir, translationId, translationRevision, extra) => {
        if (!translationRevision || extra) {
            throw new Error("succinctPath requires 4 args");
        }
        return path.join(
            transPath(dataPath, translationDir, translationId, translationRevision),
            'succinct.json'
        );
    }

const succinctErrorPath =
    (dataPath, translationDir, translationId, translationRevision, extra) => {
        if (!translationRevision || extra) {
            throw new Error("succinctErrorPath requires 4 args");
        }
        return path.join(
            transPath(dataPath, translationDir, translationId, translationRevision),
            'succinctError.json'
        );
    }

const lockPath =
    (dataPath, translationDir, translationId, translationRevision, extra) => {
        if (!translationRevision || extra) {
            throw new Error("lockPath requires 4 args");
        }
        return path.join(
            transPath(dataPath, translationDir, translationId, translationRevision),
            'lock.json'
        );
    }

const vrsPath =
    (dataPath, translationDir, translationId, translationRevision, extra) => {
        if (!translationRevision || extra) {
            throw new Error("vrsPath requires 4 args");
        }
        return path.join(
            transPath(dataPath, translationDir, translationId, translationRevision),
            'versification.vrs'
        );
    }

module.exports = {
    orgPath,
    transPath,
    transParentPath,
    usfmDir,
    usxDir,
    perfDir,
    simplePerfDir,
    sofriaDir,
    succinctPath,
    succinctErrorPath,
    lockPath,
    vrsPath
};
