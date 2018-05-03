const SvnBase = require("./SvnBase");

class SvnInfo extends SvnBase {
    /**
     * @return {Promise<SvnInfo>}
     */
    run() {
		this.then = false;
        let command = `${this.svn.cmd} info`;
        return this.svn.exec(command).then(text => this.load(text));
    }
    /**
     * @param {String} text 
     */
    load(text) {
        this.working_copy_root_path = "";
        this.url = "";
        this.relative_url = "";
        this.repository_root = "";
        this.repository_uuid = "";
        this.revision = "";
        this.node_kind = "";
        this.schedule = "";
        this.last_changed_author = "";
        this.last_changed_rev = "";
        this.last_changed_date = "";
        let lines = text.split("\n");
        for (let line of lines) {
            let ss = line.split(":");
            if (ss.length >= 2) {
                this[ss[0].trim().toLowerCase().replace(/\s+/g, '_')] = ss.slice(1).join(":").trim();
            }
        }
        return this;
    }
}

module.exports = SvnInfo;