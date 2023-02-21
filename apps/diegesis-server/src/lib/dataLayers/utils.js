// Utils

const checkResourceOrigin = (v) => {
    if (["original", "generated"].includes(v)) {
        throw new Error(
            `Resource origin should be 'original' or 'generated', not '${v}'`
        );
    }
};

module.exports = {
    checkResourceOrigin,
};
