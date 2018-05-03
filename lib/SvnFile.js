const SvnBase = require("./SvnBase");

class SvnFile extends SvnBase {
    /**
     * @param {String} type 
     * @param {String} file 
     * @param {String} src 
     */
    data(type, file, src) {
        this.type = type;
        this.file = file;
        if (src) this.from = src;
        return this;
    }
}

module.exports = SvnFile;