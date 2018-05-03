const child_process = require("child_process");
const SvnLog = require("./SvnLog");
const SvnInfo = require("./SvnInfo");
const SvnDiff = require("./SvnDiff");
const SvnMergeInfo = require("./SvnMergeInfo");
const SvnMerge = require("./SvnMerge");

class Svn {
    /**
     * @param {String} cwd svn目录
     * @param {String} cmd svn可执行程序路径
     */
    constructor(cwd, cmd) {
        this.cwd = cwd || process.cwd();
        this.cmd = cmd || "svn";
    }
    /**
     * @param {String} command 
     * @param {Number} [flag] 是否reject
     */
    exec(command, flag) {
        return new Promise((resolve, reject) => {
            console.log(command);
            child_process.exec(command, { timeout: 5e3, cwd: this.cwd }, function(err, stdout, stderr) {
                // if (command.indexOf("--dry-run") >= 0) {
                //     console.log(stdout, stderr);
                // }
                if (err && flag == 1) reject(stderr);
                else resolve(stdout);
            });
        });
    }
    prefix() {
        return this.root().then(p => new Svn(p).relative());
    }
    root() {
        return this.info().then(info => info.working_copy_root_path);
    }
    relative() {
        return this.info().then(info => info.relative_url.slice(1));
    }
    /**
     * @param {Number} begin 
     * @param {Number} [end] 
     */
    log() {
        return new SvnLog(this);
    }
    mergeInfo(url) {
        return new SvnMergeInfo(this).eligible().src(url);
    }
    merge(url) {
        return new SvnMerge(this).src(url).versions();
    }
    info() {
        if (!this._info) this._info = new SvnInfo(this).run();
        return this._info;
    }
    /**
     * @param {String} file 
     * @param {Number} begin 
     * @param {Number} [end] 
     */
    diff(file, begin, end) {
        return new SvnDiff(this).file(file).r(begin, end);
    }
}

module.exports = Svn;