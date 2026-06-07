from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from backend.database.db import get_db_connection
from backend.middleware.auth import generate_auth_token, token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registers a new user, hashes their password, and logs them in immediately by returning a token."""
    data = request.get_json() or {}
    
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()
    
    # Validation
    if not username or not email or not password or not phone:
        return jsonify({"message": "All fields (username, email, password, phone) are required!"}), 400
        
    conn = get_db_connection()
    try:
        # Check if email already exists
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            return jsonify({"message": "Email is already registered!"}), 409
            
        hashed_password = generate_password_hash(password)
        
        # Insert user
        cursor.execute(
            "INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)",
            (username, email, hashed_password, phone)
        )
        conn.commit()
        
        user_id = cursor.lastrowid
        
        # Automatically make emails ending with '@estateelite.com' an admin
        is_admin = 0
        if email.endswith('@estateelite.com'):
            is_admin = 1
            cursor.execute("UPDATE users SET is_admin = 1 WHERE id = ?", (user_id,))
            conn.commit()
            
        # Create token
        token = generate_auth_token(user_id, email, is_admin)
        
        return jsonify({
            "message": "User registered successfully!",
            "token": token,
            "user": {
                "id": user_id,
                "username": username,
                "email": email,
                "phone": phone,
                "is_admin": is_admin
            }
        }), 201
    except Exception as e:
        return jsonify({"message": "Registration failed. Please check inputs.", "error": str(e)}), 500
    finally:
        conn.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticates user credentials and signs a new JWT session token."""
    data = request.get_json() or {}
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({"message": "Email and password are required!"}), 400
        
    conn = get_db_connection()
    try:
        user = conn.execute(
            "SELECT id, username, email, password, phone, is_admin FROM users WHERE email = ?",
            (email,)
        ).fetchone()
        
        if not user or not check_password_hash(user['password'], password):
            return jsonify({"message": "Invalid email or password!"}), 401
            
        token = generate_auth_token(user['id'], user['email'], user['is_admin'])
        
        return jsonify({
            "message": "Login successful!",
            "token": token,
            "user": {
                "id": user['id'],
                "username": user['username'],
                "email": user['email'],
                "phone": user['phone'],
                "is_admin": user['is_admin']
            }
        }), 200
    except Exception as e:
        return jsonify({"message": "Login failed.", "error": str(e)}), 500
    finally:
        conn.close()

@auth_bp.route('/profile', methods=['GET'])
@token_required
def profile():
    """Returns profile information for the currently authenticated user."""
    return jsonify({"user": request.current_user}), 200
