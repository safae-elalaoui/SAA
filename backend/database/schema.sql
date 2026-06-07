-- Schema configuration for EstateElite database

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0, -- 0 for regular users, 1 for administrators
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    type TEXT NOT NULL, -- 'apartment', 'villa', 'house', 'land'
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    surface REAL NOT NULL, -- in sqm
    status TEXT NOT NULL, -- 'rent' or 'sale'
    images TEXT NOT NULL, -- Comma-separated list of image file paths or URLs
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER DEFAULT NULL, -- NULL if guest contact, otherwise user ID
    sender_name TEXT NOT NULL, -- Contact sender name
    sender_email TEXT NOT NULL, -- Contact sender email
    sender_phone TEXT DEFAULT NULL, -- Contact sender phone
    property_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    property_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_property ON messages(property_id);
