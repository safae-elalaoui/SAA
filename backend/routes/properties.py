from flask import Blueprint, request, jsonify, current_app
import os
import uuid
from werkzeug.utils import secure_filename
from backend.database.db import get_db_connection
from backend.middleware.auth import token_required
from backend.config import Config

properties_bp = Blueprint('properties', __name__)

def allowed_file(filename):
    """Helper verifying if an uploaded image has a valid, secure extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@properties_bp.route('', methods=['GET'])
def get_properties():
    """Retrieves properties with multi-criteria SQL-based filtering and sorting."""
    conn = get_db_connection()
    try:
        # Query parameters
        status = request.args.get('status', '').strip().lower() # 'rent' or 'sale'
        p_type = request.args.get('type', '').strip().lower() # 'apartment', 'villa', 'house', 'land'
        city = request.args.get('city', '').strip()
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        bedrooms = request.args.get('bedrooms', type=int)
        bathrooms = request.args.get('bathrooms', type=int)
        search_query = request.args.get('query', '').strip()
        sort_by = request.args.get('sort', 'newest').strip().lower()

        # Build dynamic SQL query
        query = "SELECT p.*, u.username as owner_name FROM properties p JOIN users u ON p.user_id = u.id WHERE 1=1"
        params = []

        if status:
            query += " AND p.status = ?"
            params.append(status)
            
        if p_type:
            query += " AND p.type = ?"
            params.append(p_type)
            
        if city:
            query += " AND p.city LIKE ?"
            params.append(f"%{city}%")
            
        if min_price is not None:
            query += " AND p.price >= ?"
            params.append(min_price)
            
        if max_price is not None:
            query += " AND p.price <= ?"
            params.append(max_price)
            
        if bedrooms is not None and bedrooms > 0:
            query += " AND p.bedrooms >= ?"
            params.append(bedrooms)
            
        if bathrooms is not None and bathrooms > 0:
            query += " AND p.bathrooms >= ?"
            params.append(bathrooms)
            
        if search_query:
            query += " AND (p.title LIKE ? OR p.description LIKE ? OR p.address LIKE ?)"
            like_val = f"%{search_query}%"
            params.extend([like_val, like_val, like_val])

        # Apply sorting
        if sort_by == 'price_asc':
            query += " ORDER BY p.price ASC"
        elif sort_by == 'price_desc':
            query += " ORDER BY p.price DESC"
        elif sort_by == 'surface_desc':
            query += " ORDER BY p.surface DESC"
        else:
            query += " ORDER BY p.created_at DESC"

        # Execute
        properties = conn.execute(query, params).fetchall()
        
        # Convert rows to dicts
        result = [dict(row) for row in properties]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "Error fetching properties", "error": str(e)}), 500
    finally:
        conn.close()

@properties_bp.route('/<int:prop_id>', methods=['GET'])
def get_property_details(prop_id):
    """Retrieves a single property listing details, its owner specs, and similar properties."""
    conn = get_db_connection()
    try:
        # Fetch property
        row = conn.execute(
            """SELECT p.*, u.username as owner_name, u.email as owner_email, u.phone as owner_db_phone
               FROM properties p 
               JOIN users u ON p.user_id = u.id 
               WHERE p.id = ?""",
            (prop_id,)
        ).fetchone()

        if not row:
            return jsonify({"message": "Property not found!"}), 404

        property_data = dict(row)

        # Fetch 3 similar listings (same city or same type, excluding current)
        similar_rows = conn.execute(
            """SELECT p.*, u.username as owner_name 
               FROM properties p
               JOIN users u ON p.user_id = u.id
               WHERE p.id != ? AND (p.city = ? OR p.type = ?) 
               LIMIT 3""",
            (prop_id, property_data['city'], property_data['type'])
        ).fetchall()
        
        similar_properties = [dict(r) for r in similar_rows]

        return jsonify({
            "property": property_data,
            "similar": similar_properties
        }), 200
    except Exception as e:
        return jsonify({"message": "Error fetching listing", "error": str(e)}), 500
    finally:
        conn.close()

@properties_bp.route('', methods=['POST'])
@token_required
def create_property():
    """Creates a new property listing with support for multipart field form-data and uploaded images."""
    try:
        user_id = request.current_user['id']
        
        # Handle regular form fields
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        price = request.form.get('price', type=float)
        city = request.form.get('city', '').strip()
        address = request.form.get('address', '').strip()
        p_type = request.form.get('type', '').strip().lower()
        bedrooms = request.form.get('bedrooms', default=0, type=int)
        bathrooms = request.form.get('bathrooms', default=0, type=int)
        surface = request.form.get('surface', type=float)
        status = request.form.get('status', '').strip().lower()
        phone = request.form.get('phone', '').strip()
        whatsapp = request.form.get('whatsapp', '').strip()

        # Validation
        if not title or not description or price is None or not city or not address or not p_type or surface is None or not status or not phone or not whatsapp:
            return jsonify({"message": "All fields (except bedrooms/bathrooms for certain types) are required!"}), 400

        # Handle file uploads
        uploaded_image_paths = []
        if 'images' in request.files:
            files = request.files.getlist('images')
            for file in files:
                if file and file.filename and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    # Unique filename prefix to prevent collisions
                    unique_filename = f"{uuid.uuid4().hex}_{filename}"
                    save_path = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
                    file.save(save_path)
                    uploaded_image_paths.append(f"uploads/{unique_filename}")

        # If no image files uploaded, fall back to premium default placeholders based on type
        if not uploaded_image_paths:
            placeholders = {
                "apartment": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
                "villa": "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
                "house": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                "land": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
            }
            uploaded_image_paths.append(placeholders.get(p_type, placeholders["apartment"]))

        images_str = ",".join(uploaded_image_paths)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO properties 
               (user_id, title, description, price, city, address, type, bedrooms, bathrooms, surface, status, images, phone, whatsapp)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user_id, title, description, price, city, address, p_type, bedrooms, bathrooms, surface, status, images_str, phone, whatsapp)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()

        return jsonify({"message": "Property listing created successfully!", "id": new_id}), 201
    except Exception as e:
        return jsonify({"message": "Error creating property", "error": str(e)}), 500

@properties_bp.route('/<int:prop_id>', methods=['PUT'])
@token_required
def update_property(prop_id):
    """Updates property details after verifying the caller owns the listing (or is an Admin)."""
    try:
        user_id = request.current_user['id']
        is_admin = request.current_user['is_admin']

        conn = get_db_connection()
        # Check ownership
        prop = conn.execute("SELECT user_id, images FROM properties WHERE id = ?", (prop_id,)).fetchone()
        if not prop:
            conn.close()
            return jsonify({"message": "Property listing not found!"}), 404

        if prop['user_id'] != user_id and not is_admin:
            conn.close()
            return jsonify({"message": "Unauthorized modification attempt!"}), 403

        # Parse new values
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        price = request.form.get('price', type=float)
        city = request.form.get('city', '').strip()
        address = request.form.get('address', '').strip()
        p_type = request.form.get('type', '').strip().lower()
        bedrooms = request.form.get('bedrooms', default=0, type=int)
        bathrooms = request.form.get('bathrooms', default=0, type=int)
        surface = request.form.get('surface', type=float)
        status = request.form.get('status', '').strip().lower()
        phone = request.form.get('phone', '').strip()
        whatsapp = request.form.get('whatsapp', '').strip()

        if not title or not description or price is None or not city or not address or not p_type or surface is None or not status or not phone or not whatsapp:
            conn.close()
            return jsonify({"message": "All fields are required!"}), 400

        # Optional new image uploads
        images_str = prop['images']
        if 'images' in request.files:
            new_files = request.files.getlist('images')
            new_uploaded_paths = []
            for file in new_files:
                if file and file.filename and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    unique_filename = f"{uuid.uuid4().hex}_{filename}"
                    save_path = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
                    file.save(save_path)
                    new_uploaded_paths.append(f"uploads/{unique_filename}")
            
            # If new files were successfully processed, overwrite or append. Let's overwrite/add them.
            if new_uploaded_paths:
                images_str = ",".join(new_uploaded_paths)

        conn.execute(
            """UPDATE properties 
               SET title = ?, description = ?, price = ?, city = ?, address = ?, type = ?, 
                   bedrooms = ?, bathrooms = ?, surface = ?, status = ?, images = ?, phone = ?, whatsapp = ?
               WHERE id = ?""",
            (title, description, price, city, address, p_type, bedrooms, bathrooms, surface, status, images_str, phone, whatsapp, prop_id)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Property listing updated successfully!"}), 200
    except Exception as e:
        return jsonify({"message": "Error updating listing", "error": str(e)}), 500

@properties_bp.route('/<int:prop_id>', methods=['DELETE'])
@token_required
def delete_property(prop_id):
    """Deletes a property after verifying the owner user or checking admin status."""
    try:
        user_id = request.current_user['id']
        is_admin = request.current_user['is_admin']

        conn = get_db_connection()
        prop = conn.execute("SELECT user_id, images FROM properties WHERE id = ?", (prop_id,)).fetchone()
        if not prop:
            conn.close()
            return jsonify({"message": "Property not found!"}), 404

        if prop['user_id'] != user_id and not is_admin:
            conn.close()
            return jsonify({"message": "Unauthorized deletion attempt!"}), 403

        # Attempt to clean up physical local images
        image_list = prop['images'].split(',')
        for img_path in image_list:
            if img_path.startswith('uploads/'):
                full_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), img_path)
                try:
                    if os.path.exists(full_path):
                        os.remove(full_path)
                except Exception:
                    pass  # Fail-safe if file locking occurs

        conn.execute("DELETE FROM properties WHERE id = ?", (prop_id,))
        conn.commit()
        conn.close()

        return jsonify({"message": "Property listing deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"message": "Error deleting listing", "error": str(e)}), 500
