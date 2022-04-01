const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    testEnviroinent: `
        export const environment = {
            production: true,
            NAME: '',
            CLUSTER_DOMAIN: '',
            ROOT_URL: '` + process.env.FYLE_TEST_MOBILE_ROOT_URL + `',
            ROUTER_API_ENDPOINT: '` + process.env.FYLE_TEST_MOBILE_ROUTER_API_ENDPOINT + `',
            ANDROID_CLIENT_ID: '` + process.env.FYLE_TEST_MOBILE_ANDROID_CLIENT_ID + `',
            IP_FIND_KEY: '` + process.env.FYLE_TEST_MOBILE_IP_FIND_KEY + `',
            GOOGLE_MAPS_API_KEY: '` + process.env.FYLE_TEST_MOBILE_GOOGLE_MAPS_API_KEY + `',
            FRESHCHAT_TOKEN: '` + process.env.FYLE_TEST_MOBILE_FRESHCHAT_TOKEN + `',
            SENTRY_DSN: '` + process.env.FYLE_TEST_MOBILE_SENTRY_DSN + `',
            REFINER_NPS_FORM_ID: '` + process.env.FYLE_TEST_REFINER_NPS_FORM_ID + `'
            };
    `
};