import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, createTenantClient } from '../config/supabase'

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
      // Check if user is superadmin
      const { data: superAdmin } = await supabase
        .from('superadmins')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (superAdmin) {
        setUserType('superadmin')
        setCompany(null)
        setIsAuthenticated(true)
        
        // Store in localStorage
        localStorage.setItem('userId', session.user.id)
        localStorage.setItem('token', session.access_token)
        localStorage.setItem('userEmail', session.user.email)
        localStorage.setItem('userType', 'superadmin')
      } else {
        // Check if user belongs to a company
        const { data: companies } = await supabase
          .from('companies')
          .select('*')
          .eq('is_verified', true)

        let userCompany = null
        if (companies && companies.length > 0) {
          for (const comp of companies) {
            try {
              // Check if user exists in this company's schema
              const tenantClient = createTenantClient(comp.schema_name)
              const { data: companyUser } = await tenantClient
                .from('users')
                .select('*')
                .eq('email', session.user.email)
                .single()

              if (companyUser) {
                userCompany = comp
                break
              }
            } catch (error) {
              // Continue to next company if this one fails
              console.log(`No user found in ${comp.schema_name}`)
            }
          }
        }

        if (userCompany) {
          setUserType('company')
          setCompany(userCompany)
          setIsAuthenticated(true)
          
          // Store in localStorage
          localStorage.setItem('userId', session.user.id)
          localStorage.setItem('token', session.access_token)
          localStorage.setItem('userEmail', session.user.email)
          localStorage.setItem('userType', 'company')
          localStorage.setItem('company', JSON.stringify(userCompany))
        } else {
          // User not found in any company or company not verified
          await supabase.auth.signOut()
          throw new Error('Access denied. Company not verified or user not found.')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      await supabase.auth.signOut()
    }
    setLoading(false)
  }

  const handleQuestLogin = async ({ userId, token, newUser }) => {
    try {
      // Store Quest authentication data
      localStorage.setItem('userId', userId)
      localStorage.setItem('token', token)
      localStorage.setItem('userEmail', userId) // Using userId as email for Quest
      
      // For demo purposes, determine user type based on email
      if (userId === 'admin@system.com') {
        setUserType('superadmin')
        setCompany(null)
        localStorage.setItem('userType', 'superadmin')
      } else {
        // Default to company user
        setUserType('company')
        // Set a default company for demo
        const defaultCompany = {
          id: 'demo-company',
          name: 'Demo Company',
          schema_name: 'saas01_testco01'
        }
        setCompany(defaultCompany)
        localStorage.setItem('userType', 'company')
        localStorage.setItem('company', JSON.stringify(defaultCompany))
      }
      
      setUser({ id: userId, email: userId })
      setIsAuthenticated(true)
      
      return { newUser, userType: localStorage.getItem('userType') }
    } catch (error) {
      console.error('Quest login error:', error)
      throw error
    }
  }

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
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
    logout,
    handleQuestLogin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}