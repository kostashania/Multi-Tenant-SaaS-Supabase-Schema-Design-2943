import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/Auth/LoginPage'
import SuperAdminDashboard from './components/SuperAdmin/SuperAdminDashboard'
import CompanyDashboard from './components/Company/CompanyDashboard'
import './App.css'

const AppContent = () => {
  const { user, userType, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          userType === 'superadmin' ? (
            <Navigate to="/superadmin" replace />
          ) : (
            <Navigate to="/company" replace />
          )
        } 
      />
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )
        } 
      />
      <Route 
        path="/superadmin" 
        element={
          userType === 'superadmin' ? (
            <SuperAdminDashboard />
          ) : (
            <Navigate to="/company" replace />
          )
        } 
      />
      <Route 
        path="/company" 
        element={
          userType === 'company' ? (
            <CompanyDashboard />
          ) : (
            <Navigate to="/superadmin" replace />
          )
        } 
      />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App