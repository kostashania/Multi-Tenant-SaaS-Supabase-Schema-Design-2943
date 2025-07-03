import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://smkhqyxtjrtavlzgjbqm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2hxeXh0anJ0YXZsemdqYnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzM1MjgsImV4cCI6MjA2NjU0OTUyOH0.qsEvNlujeYTu1aTIy2ne_sbYzl9XW5Wv1VrxLoYkjD4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'saas02'
  }
})

// Helper function to create client for specific tenant schema
export const createTenantClient = (schemaName) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: schemaName
    }
  })
}