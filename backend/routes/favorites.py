from flask import Blueprint, request, jsonify
from backend.database.db import get_db_connection
from backend.middleware.auth import token_required

favorites_bp = Blueprint('favorites', __name__)

@favorites_bp.route('/toggle', methods=['POST'])
@token_required
def toggle_favorite():
    """Toggles favorite bookmark status for a property. Adds it if not bookmarked, removes if already bookmarked."""
    data = request.get_json() or {}
    property_id = data.get('property_id')
    user_id = request.current_user['id']

    if not property_id:
        return jsonify({"message": "Property ID is required!"}), 400

    conn = get_db_connection()
    try:
        # Check if property listing exists
        prop = conn.execute("SELECT id FROM properties WHERE id = ?", (property_id,)).fetchone()
        if not prop:
            conn.close()
            return jsonify({"message": "Property listing not found!"}), 404

        # Check if already in favorites
        fav = conn.execute(
            "SELECT id FROM favorites WHERE user_id = ? AND property_id = ?",
            (user_id, property_id)
        ).fetchone()

        cursor = conn.cursor()
        if fav:
            # Already exists, remove it
            cursor.execute(
                "DELETE FROM favorites WHERE user_id = ? AND property_id = ?",
                (user_id, property_id)
            )
            conn.commit()
            status = "removed"
            message = "Removed from favorites."
        else:
            # Does not exist, add it
            cursor.execute(
                "INSERT INTO favorites (user_id, property_id) VALUES (?, ?)",
                (user_id, property_id)
            )
            conn.commit()
            status = "added"
            message = "Added to favorites."

        return jsonify({"status": status, "message": message}), 200
    except Exception as e:
        return jsonify({"message": "Failed to toggle favorite status", "error": str(e)}), 500
    finally:
        conn.close()

@favorites_bp.route('', methods=['GET'])
@token_required
def get_favorites():
    """Retrieves all property listings currently bookmarked (favorited) by the logged-in user."""
    user_id = request.current_user['id']
    conn = get_db_connection()
    try:
        # Retrieve all listings in favorites
        fav_listings = conn.execute(
            """SELECT p.*, u.username as owner_name 
               FROM favorites f 
               JOIN properties p ON f.property_id = p.id
               JOIN users u ON p.user_id = u.id
               WHERE f.user_id = ?
               ORDER BY f.created_at DESC""",
            (user_id,)
        ).fetchall()

        result = [dict(row) for row in fav_listings]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Failed to load favorites", "error": str(e)}), 500
    finally:
        conn.close()
