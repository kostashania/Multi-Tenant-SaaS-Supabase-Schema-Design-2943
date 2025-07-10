import React, { useState, useEffect } from 'react'
import { OnBoarding } from '@questlabs/react-sdk'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import questConfig from '../../config/questConfig'

const OnboardingPage = () => {
  const { user, userType, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')

  const getAnswers = () => {
    console.log('Onboarding completed with answers:', answers)
    
    // Navigate to appropriate dashboard after onboarding
    if (userType === 'superadmin') {
      navigate('/superadmin')
    } else {
      navigate('/company')
    }
  }

  if (!isAuthenticated || !userId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 via-blue-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6">
              Let's Get You
              <span className="block text-green-200">Started!</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              We're setting up your personalized experience. This will only take a moment.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                <span className="text-green-100">Personalized dashboard</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">Tailored features</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                <span className="text-purple-100">Optimized workflow</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-300/20 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-300/20 rounded-full blur-md"></div>
      </div>

      {/* Right Section - Onboarding Component */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h2>
              <p className="text-gray-600">Let's personalize your experience</p>
            </div>

            <div className="quest-onboarding-container" style={{ minHeight: '400px' }}>
              <OnBoarding
                userId={userId}
                token={token}
                questId={questConfig.QUEST_ONBOARDING_QUESTID}
                answer={answers}
                setAnswer={setAnswers}
                getAnswers={getAnswers}
                accent={questConfig.PRIMARY_COLOR}
                singleChoose="modal1"
                multiChoice="modal2"
                styling={{
                  primaryColor: questConfig.PRIMARY_COLOR,
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <OnBoarding.Header />
                <OnBoarding.Content />
                <OnBoarding.Footer />
              </OnBoarding>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default OnboardingPage