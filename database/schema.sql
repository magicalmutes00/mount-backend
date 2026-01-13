-- Devasahayam Mount Shrine Database Schema
-- PostgreSQL Database: shrine_db
-- Created: 2026-01-11

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ADMIN MANAGEMENT TABLES
-- =============================================

-- Admins table for authentication
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- DONATION MANAGEMENT TABLES
-- =============================================

-- Donation purposes lookup table
CREATE TABLE IF NOT EXISTS donation_purposes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    donor_name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    purpose VARCHAR(255) NOT NULL,
    purpose_id INTEGER REFERENCES donation_purposes(id),
    donation_type VARCHAR(50) DEFAULT 'online' CHECK (donation_type IN ('online', 'offline', 'cash')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    payment_method VARCHAR(50) DEFAULT 'upi' CHECK (payment_method IN ('upi', 'cash', 'cheque', 'bank_transfer')),
    utr_number VARCHAR(50),
    screenshot_path VARCHAR(500),
    screenshot_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- MASS BOOKING TABLES
-- =============================================

-- Mass bookings table
CREATE TABLE IF NOT EXISTS mass_bookings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    preferred_time VARCHAR(10) NOT NULL,
    intention_type VARCHAR(50) NOT NULL,
    intention_description TEXT NOT NULL,
    number_of_days INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mass booking payments table
CREATE TABLE IF NOT EXISTS mass_booking_payments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    amount DECIMAL(10, 2) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    utr_number VARCHAR(50) NOT NULL,
    screenshot_path VARCHAR(500) NOT NULL,
    screenshot_name VARCHAR(255) NOT NULL,
    mass_details JSONB,
    status VARCHAR(20) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CONTENT MANAGEMENT TABLES
-- =============================================

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    image_path VARCHAR(500) NOT NULL,
    image_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Testimonies table
CREATE TABLE IF NOT EXISTS testimonies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    testimony TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    is_approved BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Management/Staff table
CREATE TABLE IF NOT EXISTS management (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    description TEXT,
    image_path VARCHAR(500),
    image_name VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fathers/Clergy table
CREATE TABLE IF NOT EXISTS fathers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    position VARCHAR(255),
    description TEXT,
    image_path VARCHAR(500),
    image_name VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- COMMUNICATION TABLES
-- =============================================

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prayer requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    prayer_intention TEXT NOT NULL,
    is_urgent BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- LIVESTREAM MANAGEMENT
-- =============================================

-- Livestream settings table
CREATE TABLE IF NOT EXISTS livestream_settings (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    stream_url VARCHAR(500) NOT NULL,
    embed_code TEXT,
    is_active BOOLEAN DEFAULT true,
    schedule_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PAYMENT TRACKING
-- =============================================

-- General payments table (for tracking all payments)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_type VARCHAR(50) NOT NULL, -- 'donation', 'mass_booking', etc.
    reference_id INTEGER, -- ID from related table
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'upi',
    utr_number VARCHAR(50),
    screenshot_path VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',
    verified_by INTEGER REFERENCES admins(id),
    verified_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Admin indexes
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);

-- Donation indexes
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_purpose ON donations(purpose);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_donations_donor_name ON donations(donor_name);

-- Mass booking indexes
CREATE INDEX IF NOT EXISTS idx_mass_bookings_status ON mass_bookings(status);
CREATE INDEX IF NOT EXISTS idx_mass_bookings_date ON mass_bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_mass_bookings_created_at ON mass_bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_mass_booking_payments_status ON mass_booking_payments(status);
CREATE INDEX IF NOT EXISTS idx_mass_booking_payments_created_at ON mass_booking_payments(created_at);

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_start_date ON announcements(start_date);
CREATE INDEX IF NOT EXISTS idx_gallery_is_active ON gallery(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_testimonies_is_approved ON testimonies(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonies_is_featured ON testimonies(is_featured);

-- Communication indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default donation purposes
INSERT INTO donation_purposes (name, description) VALUES
('General Donation', 'General support for shrine maintenance and activities'),
('Feast Day Celebration', 'Support for special feast day celebrations and events'),
('Shrine Renovation', 'Contributions for shrine building maintenance and renovation'),
('Charity Work', 'Support for charitable activities and community service'),
('Education Fund', 'Support for educational programs and scholarships'),
('Poor Relief', 'Direct assistance to needy families and individuals')
ON CONFLICT (name) DO NOTHING;

-- Insert default livestream setting (placeholder)
INSERT INTO livestream_settings (platform, stream_url, is_active) VALUES
('YouTube', 'https://www.youtube.com/embed/PLACEHOLDER', false)
ON CONFLICT DO NOTHING;

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mass_bookings_updated_at BEFORE UPDATE ON mass_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mass_booking_payments_updated_at BEFORE UPDATE ON mass_booking_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonies_updated_at BEFORE UPDATE ON testimonies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_management_updated_at BEFORE UPDATE ON management FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fathers_updated_at BEFORE UPDATE ON fathers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON prayer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_livestream_settings_updated_at BEFORE UPDATE ON livestream_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS FOR REPORTING
-- =============================================

-- View for donation summary
CREATE OR REPLACE VIEW donation_summary AS
SELECT 
    dp.name as purpose,
    COUNT(d.id) as donation_count,
    COALESCE(SUM(d.amount), 0) as total_amount,
    COUNT(CASE WHEN d.status = 'verified' THEN 1 END) as verified_count,
    COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_count
FROM donation_purposes dp
LEFT JOIN donations d ON dp.id = d.purpose_id
WHERE dp.is_active = true
GROUP BY dp.id, dp.name
ORDER BY total_amount DESC;

-- View for mass booking summary
CREATE OR REPLACE VIEW mass_booking_summary AS
SELECT 
    DATE_TRUNC('month', start_date) as month,
    COUNT(*) as booking_count,
    SUM(total_amount) as total_amount,
    COUNT(CASE WHEN status = 'read' THEN 1 END) as processed_count
FROM mass_bookings
GROUP BY DATE_TRUNC('month', start_date)
ORDER BY month DESC;

-- =============================================
-- PERMISSIONS (Run as superuser)
-- =============================================

-- Create database user for the application (uncomment and modify as needed)
-- CREATE USER shrine_app WITH PASSWORD 'your_secure_password_here';
-- GRANT CONNECT ON DATABASE shrine_db TO shrine_app;
-- GRANT USAGE ON SCHEMA public TO shrine_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO shrine_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO shrine_app;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Database: shrine_db';
    RAISE NOTICE 'Tables created: %, %, %, %, %, %, %, %, %, %, %, %, %', 
        'admins', 'donations', 'donation_purposes', 'mass_bookings', 'mass_booking_payments',
        'announcements', 'gallery', 'testimonies', 'management', 'fathers',
        'contact_messages', 'prayer_requests', 'livestream_settings', 'payments';
    RAISE NOTICE 'Next step: Create default admin user by running the application';
END $$;