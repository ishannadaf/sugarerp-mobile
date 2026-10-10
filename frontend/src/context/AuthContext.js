import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  apiGet,
  apiPost,
  tokenStorage,
} from '../services/apiClient';

const AuthContext = createContext(null);

/**
 * Backend /users/me currently returns:
 * {
 *   success: true,
 *   data: {
 *     id, username, full_name, roles: [...],
 *     permissions: [...]
 *   }
 * }
 *
 * This also supports a direct user object in case the API response
 * is changed later.
 */
function normalizeUser(response) {
  const user = response?.data ?? response?.user ?? response;

  if (!user || typeof user !== 'object' || !user.id) {
    throw new Error('The user profile response is invalid.');
  }

  return {
    ...user,
    roles: Array.isArray(user.roles) ? user.roles : [],
    permissions: Array.isArray(user.permissions)
      ? user.permissions
      : [],
  };
}

function getRoleName(role) {
  return typeof role === 'string' ? role : role?.name;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = await tokenStorage.getToken();

      if (!token) {
        setUser(null);
        return;
      }

      const response = await apiGet('/users/me');
      setUser(normalizeUser(response));
    } catch (error) {
      console.error(
        'Authentication restore failed:',
        error?.message || error
      );

      // Clear only an invalid/expired token. Keep the token if the
      // API is temporarily unreachable or returns a server error.
      if (error?.status === 401 || error?.status === 403) {
        try {
          await tokenStorage.removeToken();
        } catch (storageError) {
          console.error(
            'Could not clear the authentication token:',
            storageError?.message || storageError
          );
        }
      }

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (username, password) => {
    const response = await apiPost('/auth/login', {
      username,
      password,
    });

    if (!response?.access_token) {
      throw new Error('The login API did not return an access token.');
    }

    await tokenStorage.setToken(response.access_token);

    try {
      const profileResponse = await apiGet('/users/me');
      const currentUser = normalizeUser(profileResponse);

      setUser(currentUser);
      return currentUser;
    } catch (error) {
      // Do not leave a token saved if login succeeds but the profile
      // cannot be loaded or validated.
      try {
        await tokenStorage.removeToken();
      } catch (storageError) {
        console.error(
          'Could not clear the authentication token:',
          storageError?.message || storageError
        );
      }

      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await tokenStorage.removeToken();
    } finally {
      setUser(null);
    }
  }, []);

  const hasRole = useCallback(
    (roleName) =>
      Boolean(
        user?.roles?.some(
          (role) => getRoleName(role) === roleName
        )
      ),
    [user]
  );

  const hasPermission = useCallback(
    (permissionCode) =>
      Boolean(user?.permissions?.includes(permissionCode)),
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        hasRole,
        hasPermission,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
