from flask import Blueprint, request, jsonify
from backend.database.db import get_db_connection
from backend.middleware.auth import token_required, decode_jwt
from backend.config import Config

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('', methods=['POST'])
def send_message():
    """Sends an inquiry message about a property. Supports both logged-in users and guest senders."""
    data = request.get_json() or {}
    
    property_id = data.get('property_id')
    message = data.get('message', '').strip()
    
    # Optional fields for guest details
    sender_name = data.get('sender_name', '').strip()
    sender_email = data.get('sender_email', '').strip().lower()
    sender_phone = data.get('sender_phone', '').strip()

    if not property_id or not message:
        return jsonify({"message": "Property ID and message content are required!"}), 400

    conn = get_db_connection()
    try:
        # Check if property exists
        prop = conn.execute("SELECT id, user_id FROM properties WHERE id = ?", (property_id,)).fetchone()
        if not prop:
            conn.close()
            return jsonify({"message": "Property listing not found!"}), 404

        # Extract current user if token is supplied (optional authentication)
        sender_id = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            payload = decode_jwt(token, Config.SECRET_KEY)
            if payload:
                sender_id = payload['user_id']
                
                # Fetch user details automatically
                user = conn.execute("SELECT username, email, phone FROM users WHERE id = ?", (sender_id,)).fetchone()
                if user:
                    sender_name = user['username']
                    sender_email = user['email']
                    sender_phone = user['phone']

        # Guest sender validation if not authenticated
        if not sender_id and (not sender_name or not sender_email):
            conn.close()
            return jsonify({"message": "Sender name and email are required for guest inquiries!"}), 400

        # Insert message
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO messages 
               (sender_id, sender_name, sender_email, sender_phone, property_id, message)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (sender_id, sender_name, sender_email, sender_phone, property_id, message)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Message sent successfully!"}), 201
    except Exception as e:
        return jsonify({"message": "Failed to send message", "error": str(e)}), 500

@messages_bp.route('/my-inbox', methods=['GET'])
@token_required
def get_inbox():
    """Retrieves inquiry messages sent by buyers regarding the active listings owned by the logged-in user."""
    user_id = request.current_user['id']
    conn = get_db_connection()
    try:
        # SQL query to join messages, properties, and the owner
        messages = conn.execute(
            """SELECT m.*, p.title as property_title, p.price as property_price, p.images as property_images 
               FROM messages m 
               JOIN properties p ON m.property_id = p.id 
               WHERE p.user_id = ?
               ORDER BY m.created_at DESC""",
            (user_id,)
        ).fetchall()
        
        result = [dict(row) for row in messages]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error loading inbox", "error": str(e)}), 500
    finally:
        conn.close()

@messages_bp.route('/my-sent', methods=['GET'])
@token_required
def get_sent_messages():
    """Retrieves inquiry messages sent by the logged-in user regarding other listings."""
    user_id = request.current_user['id']
    conn = get_db_connection()
    try:
        messages = conn.execute(
            """SELECT m.*, p.title as property_title, p.price as property_price, p.images as property_images, p.city as property_city 
               FROM messages m
               JOIN properties p ON m.property_id = p.id
               WHERE m.sender_id = ?
               ORDER BY m.created_at DESC""",
            (user_id,)
        ).fetchall()
        
        result = [dict(row) for row in messages]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error loading sent messages", "error": str(e)}), 500
    finally:
        conn.close()
