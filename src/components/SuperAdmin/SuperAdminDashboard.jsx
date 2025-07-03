import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import CompanyManagement from './CompanyManagement'
import PackageManagement from './PackageManagement'
import SubscriptionManagement from './SubscriptionManagement'

const { FiUsers, FiPackage, FiCreditCard, FiLogOut, FiBarChart3 } = FiIcons

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalCompanies: 0,
    verifiedCompanies: 0,
    totalSubscriptions: 0,
    totalPackages: 0
  })
  const { logout } = useAuth()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [companies, subscriptions, packages] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact' }),
        supabase.from('subscriptions').select('*', { count: 'exact' }),
        supabase.from('packages').select('*', { count: 'exact' })
      ])

      const verifiedCount = companies.data?.filter(c => c.is_verified).length || 0

      setStats({
        totalCompanies: companies.count || 0,
        verifiedCompanies: verifiedCount,
        totalSubscriptions: subscriptions.count || 0,
        totalPackages: packages.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart3 },
    { id: 'companies', label: 'Companies', icon: FiUsers },
    { id: 'packages', label: 'Packages', icon: FiPackage },
    { id: 'subscriptions', label: 'Subscriptions', icon: FiCreditCard }
  ]

  const statCards = [
    { title: 'Total Companies', value: stats.totalCompanies, color: 'blue' },
    { title: 'Verified Companies', value: stats.verifiedCompanies, color: 'green' },
    { title: 'Active Subscriptions', value: stats.totalSubscriptions, color: 'purple' },
    { title: 'Available Packages', value: stats.totalPackages, color: 'orange' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'companies':
        return <CompanyManagement onUpdate={fetchStats} />
      case 'packages':
        return <PackageManagement onUpdate={fetchStats} />
      case 'subscriptions':
        return <SubscriptionManagement onUpdate={fetchStats} />
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl p-6 shadow-lg border-l-4 border-${card.color}-500`}
              >
                <h3 className="text-sm font-medium text-gray-500 mb-2">{card.title}</h3>
                <p className={`text-3xl font-bold text-${card.color}-600`}>{card.value}</p>
              </motion.div>
            ))}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your SaaS platform</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <SafeIcon icon={FiLogOut} className="h-4 w-4" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <SafeIcon icon={tab.icon} className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard