import { createContext, useContext, useState } from 'react';

// Create the global context
const GlobalContext = createContext();

// Custom hook for accessing the global context
const useGlobal = () => useContext(GlobalContext);

// Global provider component
const GlobalProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <GlobalContext.Provider value={{ 
      userId, setUserId,
      toast, showToast,
     }}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalProvider, useGlobal };