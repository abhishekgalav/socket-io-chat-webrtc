import {
  useState,
} from 'react';

import Login from './pages/Login';
import Chat from './pages/Chat';

function App() {

  const [token, setToken] =
    useState<string | null>(
      localStorage.getItem(
        'accessToken',
      ),
    );

  const [user, setUser] =
    useState<any>(() => {

      const saved =
        localStorage.getItem(
          'user',
        );

      return saved
        ? JSON.parse(saved)
        : null;
    });

  const handleLogin = (
    accessToken: string,
    loggedInUser: any,
  ) => {

    setToken(accessToken);
    setUser(loggedInUser);
  };

  const handleLogout = () => {

    localStorage.removeItem(
      'accessToken',
    );

    localStorage.removeItem(
      'user',
    );

    setToken(null);
    setUser(null);
  };

  if (!token) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  return (
    <Chat
      token={token}
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;