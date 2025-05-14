import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthState, User, UserRole } from '../types';
import authService from '../services/authService';

// Define the context type
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  checkUserRole: (role: UserRole) => boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define actions for the reducer
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_CHECK_START' }
  | { type: 'AUTH_CHECK_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_CHECK_FAILURE' };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
    case 'AUTH_CHECK_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'AUTH_CHECK_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'AUTH_CHECK_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if token is valid on load
  useEffect(() => {
    const verifyToken = async () => {
      dispatch({ type: 'AUTH_CHECK_START' });
      
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'AUTH_CHECK_FAILURE' });
        return;
      }
      
      try {
        // Basic token validation - check expiration
        const decodedToken = jwtDecode<{ exp: number }>(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_CHECK_FAILURE' });
          return;
        }
        
        // Token is valid, get the user data
        const user = await authService.getCurrentUser();
        dispatch({
          type: 'AUTH_CHECK_SUCCESS',
          payload: { user, token },
        });
      } catch (error) {
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_CHECK_FAILURE' });
      }
    };
    
    verifyToken();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const data = await authService.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    } catch (error) {
      let errorMessage = 'Failed to login';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
    }
  };

  // Register function
  const register = async (email: string, password: string, role: UserRole = 'user') => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const data = await authService.register(email, password, role);
      dispatch({ type: 'REGISTER_SUCCESS', payload: data });
    } catch (error) {
      let errorMessage = 'Failed to register';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  // Check if user has a specific role
  const checkUserRole = (role: UserRole) => {
    return state.user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        checkUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};