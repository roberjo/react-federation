import AuthStore from './AuthStore'
import { oktaAuth } from '../config/oktaConfig'

class RootStore {
  authStore: AuthStore

  constructor() {
    this.authStore = new AuthStore(oktaAuth)
  }

  async initialize() {
    await this.authStore.initialize()
  }
}

export default RootStore

