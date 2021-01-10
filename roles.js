// Install access control: npm i accesscontrol -s

const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (() => {
    ac.grant("candidate")
        .readOwn("profile")
        .updateOwn("profile")
    ac.grant("recruiter")
        .extend("candidate")
    return ac;

})();