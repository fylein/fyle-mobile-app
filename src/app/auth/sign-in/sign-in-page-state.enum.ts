export enum SignInPageState {
  SELECT_SIGN_IN_METHOD = 'SELECT_SIGN_IN_METHOD', // Google Sign In and normal sign in redirection from here
  ENTER_EMAIL = 'ENTER_EMAIL', // user can enter email and proceed to next step, SSO flow begins after this step
  ENTER_PASSWORD = 'ENTER_PASSWORD', // user can enter their password for login here
}
