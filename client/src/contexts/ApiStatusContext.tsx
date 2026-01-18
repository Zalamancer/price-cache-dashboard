import { createContext, useContext, useState, ReactNode } from "react";

interface ApiStatusContextType {
  isRealApi: boolean;
  setIsRealApi: (value: boolean) => void;
}

const ApiStatusContext = createContext<ApiStatusContextType | undefined>(undefined);

export function ApiStatusProvider({ children }: { children: ReactNode }) {
  const [isRealApi, setIsRealApi] = useState(false);

  return (
    <ApiStatusContext.Provider value={{ isRealApi, setIsRealApi }}>
      {children}
    </ApiStatusContext.Provider>
  );
}

export function useApiStatusContext() {
  const context = useContext(ApiStatusContext);
  if (!context) {
    throw new Error("useApiStatusContext must be used within ApiStatusProvider");
  }
  return context;
}
