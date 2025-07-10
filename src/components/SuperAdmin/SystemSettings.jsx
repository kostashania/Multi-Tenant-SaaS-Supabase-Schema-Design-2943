import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiSettings, FiSave, FiToggleLeft, FiToggleRight, FiMail, FiShield } = FiIcons

const SystemSettings = ({ onUpdate }) => {
  const [settings, setSettings] = useState({
    otp_enabled: false,
    otp_method: 'email', // 'email' or 'sms'
    session_timeout: 24, // hours
    max_login_attempts: 5,
    require_password_change: false,
    password_expiry_days: 90
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      // In a real app, this would save to Supabase
      // For demo purposes, we'll just simulate success
      setTimeout(() => {
        setMessage('Settings saved successfully!')
        setSaving(false)
        onUpdate()
      }, 1000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Error saving settings. Please try again.')
      setSaving(false)
    }
  }

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <SafeIcon icon={FiSave} className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </motion.button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}
        >
          {message}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SafeIcon icon={FiShield} className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Authentication</h3>
          </div>

          <div className="space-y-4">
            {/* OTP Settings */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">OTP Verification</h4>
                <p className="text-sm text-gray-600">Require OTP for login (disabled by default)</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggle('otp_enabled')}
                className={`p-1 rounded-full transition-colors ${
                  settings.otp_enabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <SafeIcon 
                  icon={settings.otp_enabled ? FiToggleRight : FiToggleLeft} 
                  className={`h-6 w-6 ${settings.otp_enabled ? 'text-white' : 'text-gray-600'}`}
                />
              </motion.button>
            </div>

            {/* OTP Method */}
            {settings.otp_enabled && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Method
                </label>
                <select
                  value={settings.otp_method}
                  onChange={(e) => handleChange('otp_method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            )}

            {/* Max Login Attempts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.max_login_attempts}
                onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Session Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <SafeIcon icon={FiSettings} className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Session Management</h3>
          </div>

          <div className="space-y-4">
            {/* Session Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.session_timeout}
                onChange={(e) => handleChange('session_timeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password Settings */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Require Password Change</h4>
                <p className="text-sm text-gray-600">Force users to change password on first login</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggle('require_password_change')}
                className={`p-1 rounded-full transition-colors ${
                  settings.require_password_change ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <SafeIcon 
                  icon={settings.require_password_change ? FiToggleRight : FiToggleLeft} 
                  className={`h-6 w-6 ${settings.require_password_change ? 'text-white' : 'text-gray-600'}`}
                />
              </motion.button>
            </div>

            {/* Password Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Expiry (days)
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={settings.password_expiry_days}
                onChange={(e) => handleChange('password_expiry_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* OTP Status Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiMail} className="h-5 w-5 text-yellow-600" />
          <div>
            <h4 className="font-medium text-yellow-800">OTP Configuration</h4>
            <p className="text-sm text-yellow-700">
              OTP verification is currently <strong>{settings.otp_enabled ? 'enabled' : 'disabled'}</strong>.
              {settings.otp_enabled && ` Method: ${settings.otp_method.toUpperCase()}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings