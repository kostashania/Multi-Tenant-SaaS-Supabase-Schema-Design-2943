import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QuestProvider } from '@questlabs/react-sdk'
import '@questlabs/react-sdk/dist/style.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/Auth/LoginPage'
import OnboardingPage from './components/Auth/OnboardingPage'
import SuperAdminDashboard from './components/SuperAdmin/SuperAdminDashboard'
import CompanyDashboard from './components/Company/CompanyDashboard'
import questConfig from './config/questConfig'
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
        path="/onboarding" 
        element={
          isAuthenticated ? (
            <OnboardingPage />
          ) : (
            <Navigate to="/login" replace />
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
    <QuestProvider
      apiKey={questConfig.APIKEY}
      entityId={questConfig.ENTITYID}
      apiType="PRODUCTION"
    >
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </QuestProvider>
  )
}

export default App