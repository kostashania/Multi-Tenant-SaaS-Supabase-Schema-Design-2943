-- This file contains the SQL schema for the multi-tenant SaaS application
-- Execute these commands in your Supabase SQL editor

-- =============================================
-- SCHEMA: saas02 (Main/Global Schema)
-- =============================================

-- Create the main schema
CREATE SCHEMA IF NOT EXISTS saas02;

-- Set search path to work with the schema
SET search_path TO saas02, public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Superadmins table
CREATE TABLE IF NOT EXISTS saas02.superadmins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS saas02.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  schema_name VARCHAR(100) UNIQUE NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages table
CREATE TABLE IF NOT EXISTS saas02.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL, -- in months
  options_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS saas02.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES saas02.companies(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES saas02.packages(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TENANT SCHEMAS (saas01_testco01, saas01_testco02)
-- =============================================

-- Function to create tenant schema
CREATE OR REPLACE FUNCTION create_tenant_schema(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
  -- Create the schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
  
  -- Create users table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(50) DEFAULT ''user'',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )', schema_name);
    
  -- Create categories table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )', schema_name);
    
  -- Create items table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I.items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category_id UUID REFERENCES %I.categories(id) ON DELETE SET NULL,
      price DECIMAL(10,2),
      quantity INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )', schema_name, schema_name);
    
  -- Enable RLS on all tables
  EXECUTE format('ALTER TABLE %I.users ENABLE ROW LEVEL SECURITY', schema_name);
  EXECUTE format('ALTER TABLE %I.categories ENABLE ROW LEVEL SECURITY', schema_name);
  EXECUTE format('ALTER TABLE %I.items ENABLE ROW LEVEL SECURITY', schema_name);
  
  -- Create RLS policies (allow all for now, can be restricted later)
  EXECUTE format('
    CREATE POLICY "Allow all operations" ON %I.users
    FOR ALL USING (true) WITH CHECK (true)
  ', schema_name);
  
  EXECUTE format('
    CREATE POLICY "Allow all operations" ON %I.categories
    FOR ALL USING (true) WITH CHECK (true)
  ', schema_name);
  
  EXECUTE format('
    CREATE POLICY "Allow all operations" ON %I.items
    FOR ALL USING (true) WITH CHECK (true)
  ', schema_name);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEED DATA
-- =============================================

-- Insert superadmin
INSERT INTO saas02.superadmins (email) VALUES ('admin@system.com')
ON CONFLICT (email) DO NOTHING;

-- Insert packages
INSERT INTO saas02.packages (name, duration, options_json) VALUES
  ('Basic Plan', 12, '{"can_create": true, "can_edit": true, "can_delete": true, "max_users": 10, "max_items": 1000}'),
  ('Premium Plan', 12, '{"can_create": true, "can_edit": true, "can_delete": true, "max_users": 50, "max_items": 5000}'),
  ('Enterprise Plan', 12, '{"can_create": true, "can_edit": true, "can_delete": true, "max_users": 100, "max_items": 10000}')
ON CONFLICT DO NOTHING;

-- Insert companies
INSERT INTO saas02.companies (name, slug, schema_name, admin_email, is_verified) VALUES
  ('Test Company 01', 'testco01', 'saas01_testco01', 'admin01@testco01.com', true),
  ('Test Company 02', 'testco02', 'saas01_testco02', 'admin02@testco02.com', true)
ON CONFLICT (slug) DO NOTHING;

-- Create tenant schemas
SELECT create_tenant_schema('saas01_testco01');
SELECT create_tenant_schema('saas01_testco02');

-- Insert subscriptions
INSERT INTO saas02.subscriptions (company_id, package_id, start_date, end_date)
SELECT 
  c.id,
  p.id,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year'
FROM saas02.companies c
CROSS JOIN saas02.packages p
WHERE c.slug IN ('testco01', 'testco02')
AND p.name = 'Basic Plan'
ON CONFLICT DO NOTHING;

-- Seed tenant data for testco01
INSERT INTO saas01_testco01.users (name, email, role) VALUES
  ('Admin User 01', 'admin01@testco01.com', 'admin'),
  ('Regular User 01', 'user01@testco01.com', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO saas01_testco01.categories (name, description) VALUES
  ('Electronics', 'Electronic devices and gadgets'),
  ('Clothing', 'Apparel and accessories'),
  ('Books', 'Books and educational materials')
ON CONFLICT DO NOTHING;

-- Seed tenant data for testco02
INSERT INTO saas01_testco02.users (name, email, role) VALUES
  ('Admin User 02', 'admin02@testco02.com', 'admin'),
  ('Regular User 02', 'user02@testco02.com', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO saas01_testco02.categories (name, description) VALUES
  ('Office Supplies', 'Office equipment and supplies'),
  ('Furniture', 'Office and home furniture'),
  ('Software', 'Software licenses and tools')
ON CONFLICT DO NOTHING;

-- =============================================
-- AUTHENTICATION SETUP
-- =============================================

-- Create auth users for superadmin and company users
-- Note: These would typically be created through Supabase Auth UI or API
-- For demo purposes, you can manually create these users in Supabase Auth

-- Superadmin: admin@system.com / admin123
-- Company Admin 01: admin01@testco01.com / admin123
-- Company User 01: user01@testco01.com / user123
-- Company Admin 02: admin02@testco02.com / admin123
-- Company User 02: user02@testco02.com / user123

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to get company by user email
CREATE OR REPLACE FUNCTION get_company_by_email(user_email TEXT)
RETURNS TABLE(company_id UUID, company_name TEXT, schema_name TEXT) AS $$
DECLARE
  comp RECORD;
  tenant_client_exists BOOLEAN;
BEGIN
  FOR comp IN 
    SELECT c.id, c.name, c.schema_name 
    FROM saas02.companies c 
    WHERE c.is_verified = true
  LOOP
    -- Check if user exists in this company's schema
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I.users WHERE email = $1)', comp.schema_name) 
    INTO tenant_client_exists 
    USING user_email;
    
    IF tenant_client_exists THEN
      company_id := comp.id;
      company_name := comp.name;
      schema_name := comp.schema_name;
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM saas02.superadmins WHERE email = user_email);
END;
$$ LANGUAGE plpgsql;