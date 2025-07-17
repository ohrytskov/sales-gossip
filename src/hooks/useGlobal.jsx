import { createContext, useContext, useState } from 'react';

// Create the global context
const GlobalContext = createContext();

// Custom hook for accessing the global context
const useGlobal = () => useContext(GlobalContext);

// Global provider component
const GlobalProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  return (
    <GlobalContext.Provider value={{ 
      userId, setUserId,
     }}>
      {children}
    </GlobalContext.Provider>
  );
};

export { GlobalProvider, useGlobal };