const Svn = require("./Svn");

class SvnBase {
    /**
     * @param {Svn} svn 
     */
    constructor(svn) {
        this.svn = svn;
        /** @type {Promise<this>} */
        this.$pms;
    }
    /**
     * @param {Number} begin 
     * @param {Number} end 
     */
    r(begin, end) {
        this.begin = begin || "HEAD";
        this.end = end || "HEAD";
        return this;
    }
    get _r() {
        if (this.begin) return ` -r ${this.begin}:${this.end}`;
        return "";
    }
    pms() {
        if (!this.$pms) this.$pms = this.run();
        this.then = null;
        return this.$pms;
    }
    then(resolve, reject) {
        return this.pms().then(resolve, reject);
    }
    catch (fn) {
        return this.pms().catch(fn);
    }
}

module.exports = SvnBase;