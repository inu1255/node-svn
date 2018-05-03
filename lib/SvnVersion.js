const SvnBase = require("./SvnBase");
const SvnFile = require("./SvnFile");
const utils = require("./utils");

class SvnVersion extends SvnBase {
    /**
     * @param {String} text 
     */
    load(text) {
        // r1877 | chp | 2018-03-24 13:43:36 +0800 (六, 24  3 2018) | 1 line
        // Changed paths:
        // M /branches/dev/@code/srv/@init/srv_db.sql
        // A /branches/dev/@code/srv/@init/数据库升级SQL/20180324_srv_清理原置顶作业.sql
        // M /branches/dev/@code/srv/oledu/routes/student.js

        // 作业系统：清理原“置顶作业”残留
        text = text.replace(/^r(\d+)\ \| ([^|]+) \| (\d+-\d+-\d+ \d+:\d+:\d+ [+-]\d+) [^|]+\| \d+ lines?\n[^\n]*\n/, (x0, ver, author, time, line) => {
            this.ver = ver;
            this.author = author;
            this.time = new Date(time);
            this.line = line;
            return "";
        });
        /** @type {SvnFile[]} */
        this.files = [];
        text = text.replace(/\s*([AMDR]) ([^\n]+)\n/g, (x0, type, s) => {
            let ss = s.split(" (from");
            this.files.push(new SvnFile(this.svn).data(type, ss[0], ss[1] && ss[1].slice(ss[1].length)));
            return "";
        });
        this.message = unescape(text.trim().replace(/\{U\+(\w+)\}/g, "%u$1"));
        return this;
    }

    diff(file) {
        return this.svn.diff(file, this.ver - 1, this.ver);
    }

    diffs() {
        return Promise.all(this.files.map(file => this.diff(file.file)));
    }

    contains(keys) {
        if (utils.contains(this.message, keys)) return Promise.resolve(true);
        return utils.flow(this.files.map(x => (ret, i, brk) => {
            if (ret) brk();
            return this.diff(x.file).then(diff => diff.contains(keys));
        }));
    }
}

module.exports = SvnVersion;