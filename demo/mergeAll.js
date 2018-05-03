const Svn = require("../lib/Svn");
const utils = require("../lib/utils");

/**
 * merge dev 到 trunck 分支
 */
async function mergeAll() {
    let trunk = new Svn("/project/trunk");
    let dev = new Svn("/project/dev");
    let log = await trunk.mergeInfo(dev).eligible().pms();
    if (log.vers.length) {
        let message = "merge from dev\n" + `r${utils.cVers(log.vers)}\n` + log.vers.map(ver => `r${ver.ver}:${ver.message.replace(/\s+/g,' ')}`).join("\n");
        console.log(message);
        let merge = await trunk.merge(dev).versions(log.vers);
        console.log("total", merge.done.length);
    }
}

mergeAll();