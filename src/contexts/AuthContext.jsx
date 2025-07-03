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

  useEffect(() => {
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
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await handleAuthChange(session)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setUserType(null)
          setCompany(null)
          setLoading(false)
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

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    userType,
    company,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}