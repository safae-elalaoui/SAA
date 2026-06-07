from flask import Blueprint, request, jsonify
from backend.database.db import get_db_connection
from backend.middleware.auth import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    """Compiles analytical platform metrics including listing breakdowns by type and status."""
    conn = get_db_connection()
    try:
        # Total counts
        user_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        prop_count = conn.execute("SELECT COUNT(*) FROM properties").fetchone()[0]
        message_count = conn.execute("SELECT COUNT(*) FROM messages").fetchone()[0]
        
        # Breakdown by Type
        type_breakdown = conn.execute(
            "SELECT type, COUNT(*) as count FROM properties GROUP BY type"
        ).fetchall()
        types = {row['type']: row['count'] for row in type_breakdown}
        # Ensure all types exist in output
        for p_type in ['apartment', 'villa', 'house', 'land']:
            if p_type not in types:
                types[p_type] = 0

        # Breakdown by Status
        status_breakdown = conn.execute(
            "SELECT status, COUNT(*) as count FROM properties GROUP BY status"
        ).fetchall()
        statuses = {row['status']: row['count'] for row in status_breakdown}
        for p_status in ['rent', 'sale']:
            if p_status not in statuses:
                statuses[p_status] = 0

        return jsonify({
            "users": user_count,
            "properties": prop_count,
            "messages": message_count,
            "types": types,
            "statuses": statuses
        }), 200
    except Exception as e:
        return jsonify({"message": "Error compiling analytics", "error": str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Lists all registered users on the system (restricted to Admins)."""
    conn = get_db_connection()
    try:
        users = conn.execute(
            "SELECT id, username, email, phone, is_admin, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
        result = [dict(row) for row in users]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error listing users", "error": str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/users/<int:u_id>', methods=['DELETE'])
@admin_required
def delete_user(u_id):
    """Deletes a user account and all their corresponding listings. Prevents self-deletion."""
    current_user_id = request.current_user['id']
    
    if u_id == current_user_id:
        return jsonify({"message": "Self-deletion of active administrator is not permitted!"}), 400

    conn = get_db_connection()
    try:
        # Check if user exists
        user = conn.execute("SELECT id FROM users WHERE id = ?", (u_id,)).fetchone()
        if not user:
            conn.close()
            return jsonify({"message": "User not found!"}), 404

        # Delete user (foreign key ON DELETE CASCADE will handle properties/favorites/messages)
        conn.execute("DELETE FROM users WHERE id = ?", (u_id,))
        conn.commit()
        conn.close()

        return jsonify({"message": "User account and all corresponding listings deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"message": "Failed to delete user", "error": str(e)}), 500

@admin_bp.route('/properties/<int:prop_id>', methods=['DELETE'])
@admin_required
def delete_property_override(prop_id):
    """Force deletes a property listing from the platform (restricted to Admins)."""
    conn = get_db_connection()
    try:
        prop = conn.execute("SELECT id FROM properties WHERE id = ?", (prop_id,)).fetchone()
        if not prop:
            conn.close()
            return jsonify({"message": "Property listing not found!"}), 404

        conn.execute("DELETE FROM properties WHERE id = ?", (prop_id,))
        conn.commit()
        conn.close()

        return jsonify({"message": "Property listing removed by administrator moderation!"}), 200
    except Exception as e:
        return jsonify({"message": "Failed to delete property", "error": str(e)}), 500
