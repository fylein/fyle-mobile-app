require('dotenv').config();

module.exports.getProdEnvironment = () => `
export const environment = {
  production: true,
  NAME: '',
  CLUSTER_DOMAIN: '',
  ROOT_URL: 'https://app.fyle.tech',
  ROUTER_API_ENDPOINT: 'https://accounts.fyle.tech',
  ANDROID_CLIENT_ID: '62198175306-i1714tcls0237jubfpkn5s10gnvhb5pa.apps.googleusercontent.com',
  IP_FIND_KEY: '025d2a8e-001b-4ece-9f2c-deb4db8c76bd',
  GOOGLE_MAPS_API_KEY: 'AIzaSyCb7vB5EUfVz7WrxrRvFKk1W45IQV_bvXQ',
  FRESHCHAT_TOKEN: '6ece090a-e7db-44a8-87ff-fec60f06b3da',
  SENTRY_DSN: 'https://50fc8c018ff642fa9137a985f555382d@o341960.ingest.sentry.io/5944068',
  REFINER_NPS_FORM_ID: '56ed8380-0c7f-11ec-89c5-effca223424b',
  LAUNCH_DARKLY_CLIENT_ID: '61fb848da00c1016c73fbe54',
  LIVEUPDATE_CHANNEL: 'Staging',
  LIVE_UPDATE_APP_VERSION: '6.8.0',
  SMARTLOOK_API_KEY: '5ff95a96c307f837166d53d2294198a912ab462d'
};
`