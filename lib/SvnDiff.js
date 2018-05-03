const SvnBase = require("./SvnBase");
const utils = require("./utils");

class SvnDiff extends SvnBase {
    /**
     * @return {Promise<SvnDiff>}
     */
    run() {
        let command = `${this.svn.cmd} diff${this._r} ${this._file}`;
        return this.svn.exec(command).then(text => this.load(text));
    }
    /**
     * @param {String} file 
     */
    file(file) {
        if (file.startsWith("/")) {
            return this.svn.info().then(info => {
                let tmp = file.replace(info.relative_url.slice(1), '.');
                if (tmp.length == file.length) tmp = info.repository_root + file;
                return this.file(tmp);
            });
        }
        this._file = file;
        return this;
    }
    /**
     * @param {String} text 
     */
    load(text) {
        this.text = text;
        this.sub = [];
        this.add = [];
        let lines = text.split("\n");
        lines = lines.filter(x => x.startsWith("-") || x.startsWith("+")).filter(x => !x.startsWith("+++") && !x.startsWith("---"));
        for (let line of lines) {
            if (line.startsWith("-")) {
                if (!line.startsWith("---")) {
                    this.sub.push(line.slice(1));
                }
            } else if (line.startsWith("+")) {
                if (line.startsWith("+++")) {
                    this.add.push(line.slice(1));
                }
            }
        }
        return this;
    }
    contains(keys) {
        for (let line of this.add) {
            if (utils.contains(line, keys)) {
                return true;
            }
        }
        return false;
    }
}

module.exports = SvnDiff;