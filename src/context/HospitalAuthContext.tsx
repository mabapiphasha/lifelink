import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Hospital {
  hospitalId: string;
  hospitalName: string;
  location: string;
  contact: string;
  username: string;
}

interface HospitalAuthContextType {
  hospital: Hospital | null;
  login: (hospitalData: Hospital) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const HospitalAuthContext = createContext<HospitalAuthContextType>({
  hospital: null,
  login: () => {},
  logout: () => {},
  isLoggedIn: false,
});

export function HospitalAuthProvider({ children }: { children: ReactNode }) {
  const [hospital, setHospital] = useState<Hospital | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('lifelink_hospital');
    if (stored) {
      try {
        setHospital(JSON.parse(stored));
      } catch {
        localStorage.removeItem('lifelink_hospital');
      }
    }
  }, []);

  const login = (hospitalData: Hospital) => {
    setHospital(hospitalData);
    localStorage.setItem('lifelink_hospital', JSON.stringify(hospitalData));
  };

  const logout = () => {
    setHospital(null);
    localStorage.removeItem('lifelink_hospital');
  };

  return (
    <HospitalAuthContext.Provider value={{ hospital, login, logout, isLoggedIn: !!hospital }}>
      {children}
    </HospitalAuthContext.Provider>
  );
}

export function useHospitalAuth() {
  return useContext(HospitalAuthContext);
}
