
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

// Replace with your actual values from the Cognito console
const poolData = {
  UserPoolId: 'us-east-1_HXdVW83oG',       // From user pool overview
  ClientId: '23eh5rn2s3s5cercipb0qn3175'   // From App clients tab
};

const userPool = new CognitoUserPool(poolData);

interface Hospital {
  hospitalId: string;
  hospitalName: string;
  location: string;
  contact: string;
  username: string;
}

// Build a Hospital object from the ID token claims.
// custom:* values come from the custom attributes set on the Cognito user.
function mapClaimsToHospital(payload: { [key: string]: any }): Hospital {
  return {
    hospitalId: payload['custom:hospitalId'] || '',
    hospitalName: payload['custom:hospitalName'] || '',
    location: payload['custom:location'] || '',
    contact: payload['custom:contact'] || '',
    username: payload['cognito:username'] || payload['email'] || '',
  };
}

interface HospitalAuthContextType {
  hospital: Hospital | null;
  login: (email: string, password: string) => Promise<void>;
  completeNewPassword: (newPassword: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  needsNewPassword: boolean;
}

const HospitalAuthContext = createContext<HospitalAuthContextType>({
  hospital: null,
  login: async () => {},
  completeNewPassword: async () => {},
  logout: () => {},
  isLoggedIn: false,
  isLoading: false,
  error: null,
  needsNewPassword: false,
});

export function HospitalAuthProvider({ children }: { children: ReactNode }) {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession((err: any, session: any) => {
        if (session && session.isValid()) {
          setHospital(mapClaimsToHospital(session.getIdToken().payload));
        }
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const user = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    return new Promise((resolve, reject) => {
      user.authenticateUser(authDetails, {
        onSuccess: (result) => {
          console.log("resultssss", result.getIdToken().payload)
          setHospital(mapClaimsToHospital(result.getIdToken().payload));
          setIsLoading(false);
          resolve();
        },
        onFailure: (err) => {
          setError(err.message || 'Login failed');
          setIsLoading(false);
          reject(err);
        },
        newPasswordRequired: (userAttributes) => {
          // First login - Cognito wants them to set a new password
          setCognitoUser(user);
          setNeedsNewPassword(true);
          setIsLoading(false);
          resolve();
        }
      });
    });
  };

  const completeNewPassword = async (newPassword: string): Promise<void> => {
    if (!cognitoUser) return;

    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
        onSuccess: (result) => {
          setHospital(mapClaimsToHospital(result.getIdToken().payload));
          setNeedsNewPassword(false);
          setCognitoUser(null);
          setIsLoading(false);
          resolve();
        },
        onFailure: (err) => {
          setError(err.message || 'Password change failed');
          setIsLoading(false);
          reject(err);
        }
      });
    });
  };

  const logout = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
    setHospital(null);
  };

  return (
    <HospitalAuthContext.Provider value={{
      hospital,
      login,
      completeNewPassword,
      logout,
      isLoggedIn: !!hospital,
      isLoading,
      error,
      needsNewPassword
    }}>
      {children}
    </HospitalAuthContext.Provider>
  );
}

export function useHospitalAuth() {
  return useContext(HospitalAuthContext);
}
