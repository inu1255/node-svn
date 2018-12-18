const SvnBase = require("./SvnBase");
const SvnVersion = require("./SvnVersion");
const Svn = require("./Svn");
const utils = require("./utils");

class SvnMergeInfo extends SvnBase {
    versions(vers) {
        if (vers && vers.length)
            this.vers = vers;
        return this;
    }
    _c(vers) {
        vers = vers || this.vers;
        if (vers)
            return " -c " + utils.cVers(vers);
        return "";
    }
    src(url) {
        this.done = [];
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
    run(ver) {
        if (!ver && this.vers) {
            let vers = utils.cVers(this.vers).split(",");
            return utils.flow(vers.map(ver => () => this.test(ver).then(err => {
                if (err) return Promise.reject(err);
                return this.run(ver).then(x => {
                    this.done.push(ver);
                    return x;
                });
            }))).then(x => {
                console.log("done", this.done.join(","));
                console.log("rest", vers.splice(this.done.length).join(","));
                return x;
            }, err => {
                console.log("done", this.done.join(","));
                console.log("rest", vers.splice(this.done.length).join(","));
                return Promise.reject(err)
            });
        }
        let command = `${this.svn.cmd} merge ${this._c(ver)} ${this._src}`;
        return this.svn.exec(command, 1).then(text => this.load(text));
    }
    test(vers) {
        let command = `${this.svn.cmd} merge ${this._c(vers)} --dry-run ${this._src}`;
        return this.svn.exec(command, 1).then(text => false, err => err);
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