import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiPlus, FiEdit2, FiTrash2, FiPackage } = FiIcons

const PackageManagement = ({ onUpdate }) => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    duration: 12,
    options_json: {
      can_create: true,
      can_edit: true,
      can_delete: true,
      max_users: 10,
      max_items: 1000
    }
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPackages(data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingPackage) {
        const { error } = await supabase
          .from('packages')
          .update(formData)
          .eq('id', editingPackage.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('packages')
          .insert([formData])
        
        if (error) throw error
      }

      resetForm()
      await fetchPackages()
      onUpdate()
    } catch (error) {
      console.error('Error saving package:', error)
    }
  }

  const handleEdit = (pkg) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      duration: pkg.duration,
      options_json: pkg.options_json
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (packageId) => {
    if (!confirm('Are you sure you want to delete this package?')) return

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId)

      if (error) throw error
      
      await fetchPackages()
      onUpdate()
    } catch (error) {
      console.error('Error deleting package:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      duration: 12,
      options_json: {
        can_create: true,
        can_edit: true,
        can_delete: true,
        max_users: 10,
        max_items: 1000
      }
    })
    setEditingPackage(null)
    setShowCreateForm(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Package Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4" />
          <span>Add Package</span>
        </motion.button>
      </div>

      {/* Create/Edit Package Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 border"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingPackage ? 'Edit Package' : 'Create New Package'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter package name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (months)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Users
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.options_json.max_users}
                  onChange={(e) => setFormData({
                    ...formData,
                    options_json: { ...formData.options_json, max_users: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Items
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.options_json.max_items}
                  onChange={(e) => setFormData({
                    ...formData,
                    options_json: { ...formData.options_json, max_items: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Permissions</label>
              <div className="flex flex-wrap gap-4">
                {['can_create', 'can_edit', 'can_delete'].map((permission) => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.options_json[permission]}
                      onChange={(e) => setFormData({
                        ...formData,
                        options_json: { ...formData.options_json, [permission]: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {permission.replace('can_', 'Can ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {editingPackage ? 'Update Package' : 'Create Package'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-6 border hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <SafeIcon icon={FiPackage} className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                  <p className="text-sm text-gray-500">{pkg.duration} months</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(pkg)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(pkg.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Max Users:</span>
                <span className="font-medium">{pkg.options_json.max_users}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Max Items:</span>
                <span className="font-medium">{pkg.options_json.max_items}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(pkg.options_json)
                    .filter(([key, value]) => key.startsWith('can_') && value)
                    .map(([key]) => (
                      <span
                        key={key}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {key.replace('can_', '').replace('_', ' ')}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default PackageManagement