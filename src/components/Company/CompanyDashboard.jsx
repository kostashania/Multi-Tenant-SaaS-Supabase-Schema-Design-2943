import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import UserManagement from './UserManagement'
import CategoryManagement from './CategoryManagement'
import ItemManagement from './ItemManagement'

const { FiUsers, FiFolder, FiBox, FiLogOut, FiBarChart3 } = FiIcons

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 15,
    totalCategories: 8,
    totalItems: 42
  })
  
  const { company, logout } = useAuth()
  
  // Mock tenant client for demo
  const tenantClient = {
    from: (table) => ({
      select: () => ({
        order: () => ({
          data: table === 'users' ? [
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
          ] : table === 'categories' ? [
            { id: '1', name: 'Electronics', description: 'Electronic items' },
            { id: '2', name: 'Clothing', description: 'Apparel items' }
          ] : [
            { id: '1', name: 'Laptop', description: 'MacBook Pro', category_id: '1', price: 1999.99, quantity: 10, categories: { name: 'Electronics' } },
            { id: '2', name: 'T-Shirt', description: 'Cotton T-Shirt', category_id: '2', price: 29.99, quantity: 100, categories: { name: 'Clothing' } }
          ]
        })
      }),
      insert: () => ({ error: null }),
      update: () => ({ eq: () => ({ error: null }) }),
      delete: () => ({ eq: () => ({ error: null }) })
    })
  }

  const fetchStats = () => {
    // In a real app, this would fetch from Supabase tenant schema
    // For demo purposes, we'll just update the stats
    setStats({
      totalUsers: 15,
      totalCategories: 8, 
      totalItems: 42
    })
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart3 },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'categories', label: 'Categories', icon: FiFolder },
    { id: 'items', label: 'Items', icon: FiBox }
  ]

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, color: 'blue' },
    { title: 'Categories', value: stats.totalCategories, color: 'green' },
    { title: 'Items', value: stats.totalItems, color: 'purple' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement tenantClient={tenantClient} onUpdate={() => fetchStats()} />
      case 'categories':
        return <CategoryManagement tenantClient={tenantClient} onUpdate={() => fetchStats()} />
      case 'items':
        return <ItemManagement tenantClient={tenantClient} onUpdate={() => fetchStats()} />
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <h1 className="text-2xl font-bold text-gray-900">{company?.name || 'Company'} Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your company data</p>
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

export default CompanyDashboard