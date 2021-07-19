const fs = require('fs');
const util = require('util');
const path = require('path');
const stat = util.promisify(fs.stat);

module.exports = function (ctx) {

    const stagingEnviroinent = `
    export const environment = {
        production: false,
        NAME: '',
        CLUSTER_DOMAIN: '',
        ROOT_URL: '`+process.env.FYLE_MOBILE_ROOT_URL+`',
        ROUTER_API_ENDPOINT: '`+process.env.FYLE_MOBILE_ROUTER_API_ENDPOINT+`',
        ANDROID_CLIENT_ID: '`+process.env.FYLE_MOBILE_ANDROID_CLIENT_ID+`',
        IP_FIND_KEY: '`+process.env.FYLE_MOBILE_IP_FIND_KEY+`',
        GOOGLE_MAPS_API_KEY: '`+process.env.FYLE_MOBILE_GOOGLE_MAPS_API_KEY+`',
        FRESHCHAT_TOKEN: '`+process.env.FYLE_MOBILE_FRESHCHAT_TOKEN+`',
        SENTRY_DSN: '`+process.env.FYLE_MOBILE_SENTRY_DSN+`'
      };

    `;

    // Creating environment.staging.ts file
    fs.writeFileSync(ctx.project.dir + "/src/environments/environment.staging.ts", stagingEnviroinent);

};