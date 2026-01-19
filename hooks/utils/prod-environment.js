require('dotenv').config();

module.exports.getProdEnvironment = () => `
export const environment = {
  production: true,
  NAME: '',
  ROOT_URL: '${process.env.FYLE_MOBILE_ROOT_URL}',
  ROUTER_API_ENDPOINT: '${process.env.FYLE_MOBILE_ROUTER_API_ENDPOINT}',
  ANDROID_CLIENT_ID: '${process.env.FYLE_MOBILE_ANDROID_CLIENT_ID}',
  GOOGLE_MAPS_API_KEY: '${process.env.FYLE_MOBILE_GOOGLE_MAPS_API_KEY}',
  FRESHCHAT_TOKEN: '${process.env.FYLE_MOBILE_FRESHCHAT_TOKEN}',
  SENTRY_DSN: '${process.env.FYLE_MOBILE_SENTRY_DSN}',
  REFINER_NPS_FORM_PROJECT: '${process.env.REFINER_NPS_FORM_PROJECT}',
  REFINER_NPS_FORM_ID: '${process.env.REFINER_NPS_FORM_ID}',
  LAUNCH_DARKLY_CLIENT_ID: '${process.env.LAUNCH_DARKLY_CLIENT_ID}',
  LIVE_UPDATE_APP_VERSION: '${process.env.LIVE_UPDATE_APP_VERSION}',
  MIXPANEL_PROJECT_TOKEN: '${process.env.MIXPANEL_PROJECT_TOKEN}',
  USE_MIXPANEL_PROXY: '${process.env.USE_MIXPANEL_PROXY}',
  ENABLE_MIXPANEL: '${process.env.ENABLE_MIXPANEL}',
  YODLEE_FAST_LINK_URL: '${process.env.YODLEE_FAST_LINK_URL}',
};
`;
