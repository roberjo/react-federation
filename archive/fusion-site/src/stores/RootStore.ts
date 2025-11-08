import { OktaAuth } from '@okta/okta-auth-js';
import { oktaConfig } from '../config/oktaConfig';
import AuthStore from './AuthStore';

class RootStore {
  authStore: AuthStore;
  oktaAuth: OktaAuth;

  constructor() {
    this.oktaAuth = new OktaAuth(oktaConfig);
    this.authStore = new AuthStore(this.oktaAuth);
  }

  async initialize() {
    await this.authStore.initialize();
  }
}

const rootStore = new RootStore();
export default rootStore;
