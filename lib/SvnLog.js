const SvnBase = require("./SvnBase");
const SvnVersion = require("./SvnVersion");
const utils = require("./utils");

class SvnLog extends SvnBase {
    limit(n) {
        this._limit = n;
        return this;
    }
    /**
     * @return {Promise<SvnLog>}
     */
    run() {
        let command = `${this.svn.cmd} log${this._r} ${this._limit?"-l "+this._limit:""} -v`;
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

    files() {
        let files = {};
        for (let ver of this.vers) {
            for (let file of ver.files) {
                files[file.file] = true;
            }
        }
        return Object.keys(files);
    }

    contains(keys) {
        return utils.mapLimit(this.vers.map(x => () => x.contains(keys)), 20).then(oks => {
            let log = Object.assign(new SvnLog(this.svn), this);
            log.vers = this.vers.filter((_, i) => oks[i]);
            return log;
        });
    }
}

module.exports = SvnLog;