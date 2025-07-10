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
    // Check for stored authentication first
    const storedUserId = localStorage.getItem('userId')
    const storedToken = localStorage.getItem('token')
    const storedUserType = localStorage.getItem('userType')
    const storedCompany = localStorage.getItem('company')
    const storedEmail = localStorage.getItem('userEmail')

    if (storedUserId && storedToken && storedEmail) {
      setUser({ id: storedUserId, email: storedEmail })
      setUserType(storedUserType)
      setCompany(storedCompany ? JSON.parse(storedCompany) : null)
      setIsAuthenticated(true)
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthChange(session)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          await handleAuthChange(session)
        } else if (event === 'SIGNED_OUT') {
          handleLogout()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleAuthChange = async (session) => {
    if (!session?.user?.email) {
      setLoading(false)
      return
    }

    const email = session.user.email

    try {
      // Check if user is authorized
      if (email === 'admin@system.com') {
        // Superadmin
        setUser(session.user)
        setUserType('superadmin')
        setCompany(null)
        setIsAuthenticated(true)
        
        // Store in localStorage
        localStorage.setItem('userId', session.user.id)
        localStorage.setItem('token', session.access_token)
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userType', 'superadmin')
        
      } else if (email === 'admin01@testco01.com') {
        // Company user
        const demoCompany = {
          id: '12345-demo-id',
          name: 'Test Company 01',
          slug: 'testco01',
          schema_name: 'saas01_testco01'
        }
        
        setUser(session.user)
        setUserType('company')
        setCompany(demoCompany)
        setIsAuthenticated(true)
        
        // Store in localStorage
        localStorage.setItem('userId', session.user.id)
        localStorage.setItem('token', session.access_token)
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userType', 'company')
        localStorage.setItem('company', JSON.stringify(demoCompany))
        
      } else {
        // Unauthorized user - sign them out but don't throw error
        console.warn('Unauthorized user attempted login:', email)
        await supabase.auth.signOut()
        throw new Error('Access denied. Please use valid demo credentials.')
      }
    } catch (error) {
      console.error('Auth error:', error)
      // Don't sign out again if already signed out
      if (session) {
        await supabase.auth.signOut()
      }
      // Clear any stored data
      handleLogout()
      throw error
    }
    
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      if (error) throw error
    } catch (error) {
      // Make sure we're not in a loading state
      setLoading(false)
      throw error
    }
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
    setLoading(false)
  }

  const logout = async () => {
    handleLogout()
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
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