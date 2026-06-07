import sqlite3
import os
from werkzeug.security import generate_password_hash

DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'marketplace.db')
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'schema.sql')

def get_db_connection():
    """Establishes a thread-safe connection to the SQLite database with Row support."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Initializes the database using schema.sql and seeds mock data if empty."""
    print("Initializing SQLite database...")
    if not os.path.exists(SCHEMA_PATH):
        raise FileNotFoundError(f"Schema file not found at: {SCHEMA_PATH}")

    with get_db_connection() as conn:
        with open(SCHEMA_PATH, 'r') as f:
            conn.executescript(f.read())
        conn.commit()

    seed_mock_data()

def seed_mock_data():
    """Seeds the database with premium mock listings and users if empty."""
    with get_db_connection() as conn:
        # Check if users already exist
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] > 0:
            print("Database already contains data. Skipping seeding.")
            return

        print("Seeding premium real estate data...")
        
        # 1. Seed Users (passwords: admin123, seller123, buyer123)
        admin_pass = generate_password_hash("admin123")
        seller_pass = generate_password_hash("seller123")
        buyer_pass = generate_password_hash("buyer123")

        users = [
            ("Admin Elite", "admin@estateelite.com", admin_pass, "+212 600-000001", 1),
            ("Yassir Bensalah", "yassir@bensalah.ma", seller_pass, "+212 611-223344", 0),
            ("Amine Laroui", "amine@gmail.com", buyer_pass, "+212 655-667788", 0)
        ]
        
        cursor.executemany(
            "INSERT INTO users (username, email, password, phone, is_admin) VALUES (?, ?, ?, ?, ?)",
            users
        )
        conn.commit()

        # Retrieve user IDs
        cursor.execute("SELECT id, email FROM users")
        user_rows = cursor.fetchall()
        user_ids = {row['email']: row['id'] for row in user_rows}

        yassir_id = user_ids["yassir@bensalah.ma"]
        admin_id = user_ids["admin@estateelite.com"]

        # 2. Seed Premium Properties (using Unsplash high-quality property pictures)
        properties = [
            (
                yassir_id,
                "Atlas Oasis Luxury Villa",
                "A breath-taking private estate situated in the heart of Palmeraie, Marrakech. This modern sanctuary seamlessly blends contemporary open-concept design with traditional Moroccan architectural elements. The property boasts a massive 12m infinity swimming pool, beautifully landscaped lush gardens with olive trees, an extensive glass facade overlooking the Atlas mountains, state-of-the-art home automation, private hammam, and custom designer furniture.",
                18500000, # 18.5 Million MAD
                "Marrakech",
                "Palmeraie Estate No. 42, Marrakech 40000",
                "villa",
                5,
                6,
                820.0,
                "sale",
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
                "+212611223344",
                "212611223344"
            ),
            (
                yassir_id,
                "Marina Penthouse with Panoramic Ocean Views",
                "Located on the top floor of the prestigious Marina Towers in Casablanca, this modern penthouse offers dual-aspect uninterrupted views of the Atlantic Ocean and the Hassan II Mosque. Enjoy ultra-premium glassmorphism interior partitions, high ceilings, automated floor-to-ceiling blinds, imported Italian marble floors, a professional kitchen, and an expansive 90sqm private terrace with hot tub. Ideal for executive luxury living.",
                8900000, # 8.9 Million MAD
                "Casablanca",
                "Marina Tower A, Penthouse 18, Casablanca 20000",
                "apartment",
                3,
                3,
                310.0,
                "sale",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
                "+212611223344",
                "212611223344"
            ),
            (
                admin_id,
                "Sophisticated 2-Bedroom Apartment in Gauthier",
                "Experience the vibrant energy of Casablanca in this beautifully curated 2-bedroom executive apartment in Gauthier. Offering contemporary styling with wooden accent walls, double-pane acoustic windows, central heating and AC, a spacious main suite, modern breakfast bar, dedicated secure underground parking spot, and 24/7 lobby security. Fully furnished and ready to move in.",
                18000, # 18,000 MAD / month
                "Casablanca",
                "Rue Allal Ben Abdellah, Gauthier, Casablanca",
                "apartment",
                2,
                2,
                115.0,
                "rent",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=1200&q=80",
                "+212600000001",
                "212600000001"
            ),
            (
                admin_id,
                "Cliffs Edge Mediterranean Villa",
                "Perched majestically on the cliffs overlooking the Mediterranean in Tangier, this spectacular 6-bedroom villa features classic Iberian-Moroccan architecture. Boasting a tiered patio, traditional fireplace, arched entryways, panoramic cliffside garden, infinity pool that touches the sky, and separate guest house. Live the high-end Mediterranean coastline lifestyle.",
                14200000, # 14.2 Million MAD
                "Tangier",
                "Route de la Plage, Cap Spartel, Tangier",
                "villa",
                6,
                5,
                550.0,
                "sale",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                "+212600000001",
                "212600000001"
            ),
            (
                yassir_id,
                "Modernist Eco-Friendly Villa",
                "A stunning design-forward house located in Agadir Bay. This smart, energy-efficient property features integrated solar panel grids, a greywater recycling system, minimalist concrete and warm cedar-wood design, tall glass windows, heated indoor pool, master room with walk-in wardrobe, and advanced secure perimeter. Close to fine dining and a five-minute drive to the beach.",
                6400000, # 6.4 Million MAD
                "Agadir",
                "Cité Founty, Secteur Touristique, Agadir",
                "house",
                4,
                4,
                380.0,
                "sale",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
                "+212611223344",
                "212611223344"
            ),
            (
                admin_id,
                "Development Land for Premium Hotel/Resort",
                "A stellar investment opportunity in Marrakech. Strategically situated on the main route to Ourika Valley, this flat, prime, multi-use parcel of land spans 2.4 hectares. Authorized for tourist development projects, boutique luxury resorts, or an exclusive high-end villa residential compound. Includes full utility infrastructure connection at the property line.",
                35000000, # 35 Million MAD
                "Marrakech",
                "Km 12, Route de l'Ourika, Marrakech",
                "land",
                0,
                0,
                24000.0,
                "sale",
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80,https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
                "+212600000001",
                "212600000001"
            )
        ]
        
        cursor.executemany(
            """INSERT INTO properties 
               (user_id, title, description, price, city, address, type, bedrooms, bathrooms, surface, status, images, phone, whatsapp)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            properties
        )
        conn.commit()

        # Retrieve Marrakech Villa ID for message seeding
        cursor.execute("SELECT id FROM properties WHERE title LIKE '%Atlas Oasis%'")
        villa_row = cursor.fetchone()
        if villa_row:
            villa_id = villa_row['id']
            amine_id = user_ids["amine@gmail.com"]
            
            # 3. Seed messages
            messages = [
                (
                    amine_id,
                    "Amine Laroui",
                    "amine@gmail.com",
                    "+212 655-667788",
                    villa_id,
                    "Hello Yassir, my name is Amine and I am highly interested in purchasing the Atlas Oasis Luxury Villa. I am currently pre-approved for funding and would love to schedule a private viewing this Saturday. Please let me know what time works best for you.",
                ),
                (
                    None, # Guest inquiry
                    "Karim Idrissi",
                    "karim.idrissi@gmail.com",
                    "+212 677-112233",
                    villa_id,
                    "Hi, is this Palmeraie property still available for sale? I would like to get more information regarding the private hammam size and if the furniture is fully included in the listed price. Thank you.",
                )
            ]
            
            cursor.executemany(
                """INSERT INTO messages 
                   (sender_id, sender_name, sender_email, sender_phone, property_id, message)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                messages
            )
            
            # 4. Seed favorites
            cursor.execute("INSERT OR IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)", (amine_id, villa_id))
            conn.commit()

        print("Seeding completed successfully!")

if __name__ == "__main__":
    init_db()
