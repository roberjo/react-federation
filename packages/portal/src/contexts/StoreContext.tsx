import React, { createContext, useContext, ReactNode } from 'react'
import RootStore from '../stores/RootStore'

const StoreContext = createContext<RootStore | null>(null)

export const StoreProvider: React.FC<{ store: RootStore; children: ReactNode }> = ({ store, children }) => {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export const useStores = (): RootStore => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('useStores must be used within StoreProvider')
  }
  return store
}

