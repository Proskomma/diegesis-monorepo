// Utils

const checkResourceOrigin = (v) => {
    if (["original", "generated"].includes(v)) {
        throw new Error(
            `Resource origin should be 'original' or 'generated', not '${v}'`
        );
    }
};

/**
 * @summary A error thrown when a method is defined but not implemented (yet).
 * @see https://gist.github.com/tregusti/0b37804798a7634bc49c?permalink_comment_id=4435828#gistcomment-4435828
 * @see https://stackoverflow.com/a/871646
 * @param {any} message An additional message for the error.
 */
function NotImplementedError(message) {
    this.name = "NotImplementedError";

    const sender = new Error().stack.split("\n")[2].replace(" at ", "");
    this.message = `The method ${sender} isn't implemented.`;

    // Append the message if given.
    if (message) this.message += ` Message: "${message}".`;

    let str = this.message;

    while (str.indexOf("  ") > -1) {
        str = str.replace("  ", " ");
    }

    this.message = str;
}
NotImplementedError.prototype = Error.prototype;

module.exports = {
    checkResourceOrigin,
    NotImplementedError,
};
