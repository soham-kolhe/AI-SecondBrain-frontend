import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Dashboard />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;