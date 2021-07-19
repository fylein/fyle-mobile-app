const fs = require('fs');
const util = require('util');
const path = require('path');
const stat = util.promisify(fs.stat);

module.exports = function (ctx) {
    const prodEnviroinent = `
    export const environment = {
        production: true,
        NAME: '',
        CLUSTER_DOMAIN: '',
        ROOT_URL: '`+process.env.FYLE_MOBILE_STAGING_ROOT_URL+`',
        ROUTER_API_ENDPOINT: '`+process.env.FYLE_MOBILE_STAGING_ROUTER_API_ENDPOINT+`',
        ANDROID_CLIENT_ID: '`+process.env.FYLE_MOBILE_STAGING_ANDROID_CLIENT_ID+`',
        IP_FIND_KEY: '`+process.env.FYLE_MOBILE_STAGING_IP_FIND_KEY+`',
        GOOGLE_MAPS_API_KEY: '`+process.env.FYLE_MOBILE_STAGING_GOOGLE_MAPS_API_KEY+`',
        FRESHCHAT_TOKEN: '`+process.env.FYLE_MOBILE_STAGING_FRESHCHAT_TOKEN+`',
        SENTRY_DSN: '`+process.env.FYLE_MOBILE_STAGING_SENTRY_DSN+`'
      };

    `;
    
    // Creating environment.prod.ts file
    fs.writeFileSync(ctx.project.dir + "/src/environments/environment.prod.ts", prodEnviroinent);

};