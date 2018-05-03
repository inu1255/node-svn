const fs = require("fs");

/**
 * @param {String} text 
 * @param {String[]} keys 
 */
exports.contains = function(text, keys) {
    for (let key of keys) {
        if (text.indexOf(key) >= 0) {
            return true;
        }
    }
    return false;
};

/**
 * 限制Promise同时执行的数量
 * @param {()=>Promise} tasks 
 * @param {Number} max 
 * @returns {Array}
 */
exports.mapLimit = function(tasks, max) {
    return new Promise((resolve, reject) => {
        var i = 0;
        var ok = 0;
        var ret = [];

        function next() {
            if (i < tasks.length) {
                let index = i;
                tasks[i]().then(x => (ret[index] = x, next(ok++)), reject);
            }
            i++;
            if (ok == tasks.length) {
                resolve(ret);
            }
        }
        while (max--) next();
    });
};

/**
 * 按顺序执行Promise
 * @param {Array<(ret:Any,i:Number,brk:()=>)=>Promise>} tasks 
 * @param {Any} [init]
 * @returns {Promise}
 */
exports.flow = function(tasks, init) {
    return new Promise((resolve, reject) => {
        var i = 0;
        var ret = init;
        var brk = false;

        function next(data) {
            ret = data;
            i++;
            if (!brk && i < tasks.length)
                tasks[i](ret, i).then(next, reject);
            else
                resolve(ret);
        }
        tasks[i](ret, i, () => brk = true).then(next, reject);
    });
};

exports.cVers = function(vers) {
    if (vers instanceof Array) {
        let nums = vers.map(x => x && x.ver || x);
        let prev = -1;
        let out = [];
        for (let num of nums) {
            if (num - prev < 2) {
                out[out.length - 1] = out[out.length - 1].split("-")[0] + "-" + num;
            } else {
                out.push(num);
            }
            prev = num;
        }
        return out.join(",");
    }
    return vers;
};

/**
 * 创建文件夹
 * @param {String} dir 
 * @param {Promise}
 */
exports.mkdirs = function mkdirs(dir) {
    var dirs = dir.split(/[\/\\]/);
    let tasks = [];
    for (var i = 1; i <= dirs.length; i++) {
        let tmp = dirs.slice(0, i).join("/");
        if (tmp) tasks.push(() => new Promise((resolve, reject) => fs.exists(tmp, ok => ok ? resolve() : fs.mkdir(tmp, err => err ? reject(err) : resolve()))));
    }
    return exports.flow(tasks);
};