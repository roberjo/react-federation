import { createContext, useContext } from 'react';
import rootStore from '../stores/RootStore';

const StoreContext = createContext(rootStore);

export const useStores = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStores must be used within StoreProvider');
  }
  return context;
};

export const StoreProvider = StoreContext.Provider;
