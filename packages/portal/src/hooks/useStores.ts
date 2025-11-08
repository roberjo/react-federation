import { useStores as useStoreContext } from '../contexts/StoreContext'

export const useStores = () => {
  const rootStore = useStoreContext()
  return {
    authStore: rootStore.authStore,
  }
}

