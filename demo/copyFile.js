const Svn = require("../lib/Svn");
const utils = require("../lib/utils");
const fs = require("fs");
const path = require("path");

/**
 * 复制变化的文件到单独的目录
 */
async function copyFile() {
    let svn = new Svn("/project/dev");
    let log = await svn.log().limit(1).pms();
    let prefix = await svn.prefix();
    let root = await svn.root();
    let relative = await svn.relative();
    let dir = "/tmp/svn_upload";
    await svn.exec(`rm -rf ${dir}`);
    await utils.mkdirs(dir);
    for (let file of log.files()) {
        let src = file.replace(prefix, root);
        if (fs.statSync(src).isFile()) {
            let dst = dir + file.replace(relative, "");
            await utils.mkdirs(path.dirname(dst));
            fs.createReadStream(src).pipe(fs.createWriteStream(dst));
        }
    }
    console.log("complete");
}

copyFile();