import React from 'react'
import { QuestLogin } from '@questlabs/react-sdk'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import questConfig from '../../config/questConfig'

const LoginPage = () => {
  const { handleQuestLogin } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async ({ userId, token, newUser }) => {
    try {
      const { userType } = await handleQuestLogin({ userId, token, newUser })
      
      if (newUser) {
        navigate('/onboarding')
      } else {
        // Navigate based on user type
        if (userType === 'superadmin') {
          navigate('/superadmin')
        } else {
          navigate('/company')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6">
              Welcome to Your
              <span className="block text-blue-200">SaaS Platform</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Manage your multi-tenant business with powerful tools designed for scale and efficiency.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">Multi-tenant architecture</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">Advanced user management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">Real-time analytics</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-300/20 rounded-full blur-lg"></div>
      </div>

      {/* Right Section - Authentication */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Access your dashboard</p>
            </div>

            <div className="quest-login-container">
              <QuestLogin
                onSubmit={handleLogin}
                email={true}
                google={false}
                accent={questConfig.PRIMARY_COLOR}
                styling={{
                  primaryColor: questConfig.PRIMARY_COLOR,
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div className="mt-8 text-center">
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium">Demo Credentials:</p>
                <p>Superadmin: admin@system.com / admin123</p>
                <p>Company: admin01@testco01.com / admin123</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage