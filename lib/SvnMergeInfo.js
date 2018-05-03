const SvnBase = require("./SvnBase");
const SvnVersion = require("./SvnVersion");
const Svn = require("./Svn");
const utils = require("./utils");

class SvnMergeInfo extends SvnBase {
    eligible() {
        this._revs = "eligible";
        return this;
    }
    merged() {
        this._revs = "merged";
        return this;
    }
    src(url) {
        if (url.cwd) {
            this._src = url.cwd;
        } else {
            this._src = url;
        }
        return this;
    }
    /**
     * @return {Promise<SvnMergeInfo>}
     */
    run() {
        let command = `${this.svn.cmd} mergeinfo --show-revs ${this._revs} --log ${this._src}`;
        return this.svn.exec(command).then(text => this.load(text));
    }
    /**
     * @param {String} text 
     */
    load(text) {
        let lines = text.split(/-------+\n/);
        this.vers = lines.map(x => x.trim()).filter(x => x).map(x => new SvnVersion(this.svn).load(x));
        return this;
	}
	
    contains(keys) {
        return utils.mapLimit(this.vers.map(x => () => x.contains(keys)), 20).then(oks => {
            let log = Object.assign(new SvnMergeInfo(this.svn), this);
            log.vers = this.vers.filter((_, i) => oks[i]);
            return log;
        });
    }
}

module.exports = SvnMergeInfo;