import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null) // 'superadmin' or 'company'
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for stored authentication
    const storedUserId = localStorage.getItem('userId')
    const storedToken = localStorage.getItem('token')
    const storedUserType = localStorage.getItem('userType')
    const storedCompany = localStorage.getItem('company')

    if (storedUserId && storedToken) {
      setUser({ id: storedUserId, email: localStorage.getItem('userEmail') })
      setUserType(storedUserType)
      setCompany(storedCompany ? JSON.parse(storedCompany) : null)
      setIsAuthenticated(true)
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !storedUserId) {
        handleAuthChange(session)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await handleAuthChange(session)
        } else if (event === 'SIGNED_OUT') {
          handleLogout()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleAuthChange = async (session) => {
    if (!session) {
      setLoading(false)
      return
    }

    setUser(session.user)

    try {
      // For simplicity, just set as superadmin if email is admin@system.com
      if (session.user.email === 'admin@system.com') {
        setUserType('superadmin')
        setCompany(null)
        setIsAuthenticated(true)
        
        // Store in localStorage
        localStorage.setItem('userId', session.user.id)
        localStorage.setItem('token', session.access_token)
        localStorage.setItem('userEmail', session.user.email)
        localStorage.setItem('userType', 'superadmin')
      } else if (session.user.email === 'admin01@testco01.com') {
        // For demo, just set as company if email is admin01@testco01.com
        const demoCompany = {
          id: '12345-demo-id',
          name: 'Test Company 01',
          slug: 'testco01',
          schema_name: 'saas01_testco01'
        }
        
        setUserType('company')
        setCompany(demoCompany)
        setIsAuthenticated(true)
        
        // Store in localStorage
        localStorage.setItem('userId', session.user.id)
        localStorage.setItem('token', session.access_token)
        localStorage.setItem('userEmail', session.user.email)
        localStorage.setItem('userType', 'company')
        localStorage.setItem('company', JSON.stringify(demoCompany))
      } else {
        // Not an authorized user
        await supabase.auth.signOut()
        throw new Error('Access denied. User not authorized.')
      }
    } catch (error) {
      console.error('Auth error:', error)
      await supabase.auth.signOut()
    }
    
    setLoading(false)
  }

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    if (error) throw error
  }

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('userId')
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userType')
    localStorage.removeItem('company')
    
    setUser(null)
    setUserType(null)
    setCompany(null)
    setIsAuthenticated(false)
  }

  const logout = async () => {
    handleLogout()
    await supabase.auth.signOut()
  }

  const value = {
    user,
    userType,
    company,
    loading,
    isAuthenticated,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}