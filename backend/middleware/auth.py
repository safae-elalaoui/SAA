import hmac
import hashlib
import json
import base64
import time
from functools import wraps
from flask import request, jsonify, current_app
from backend.config import Config
from backend.database.db import get_db_connection

# --- Lightweight Custom JWT Engine ---
# Standard-compliant, zero-dependency JWT generator and parser.

def base64url_encode(data: bytes) -> str:
    """Base64url encode bytes as defined in RFC 7515."""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data: str) -> bytes:
    """Base64url decode string, handling missing padding."""
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def encode_jwt(payload: dict, secret_key: str) -> str:
    """Generates a standard HS256 JWT signature."""
    header = {"alg": "HS256", "typ": "JWT"}
    
    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(payload).encode('utf-8'))
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(secret_key.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_jwt(token: str, secret_key: str) -> dict:
    """Decodes a HS256 JWT token, validating integrity and expiration."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None  # Invalid token structure
            
        header_b64, payload_b64, signature_b64 = parts
        
        # Verify signature first
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_signature = hmac.new(secret_key.encode('utf-8'), signing_input, hashlib.sha256).digest()
        expected_signature_b64 = base64url_encode(expected_signature)
        
        if not hmac.compare_digest(signature_b64, expected_signature_b64):
            return None  # Signature mismatch (tampered token)
            
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
        
        # Verify expiration
        if 'exp' in payload and time.time() > payload['exp']:
            return None  # Token expired
            
        return payload
    except Exception:
        return None

# --- Application Auth Utilities ---

def generate_auth_token(user_id: int, email: str, is_admin: int) -> str:
    """Creates a JWT auth token valid for the configured expiry length."""
    payload = {
        "user_id": user_id,
        "email": email,
        "is_admin": is_admin,
        "exp": time.time() + Config.JWT_EXPIRY,
        "iat": time.time()
    }
    return encode_jwt(payload, Config.SECRET_KEY)

# --- Flask Request Decorators ---

def token_required(f):
    """Decorator checking for a valid Bearer token in the request headers."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Extract token from the Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                
        if not token:
            return jsonify({"message": "Access token is missing!"}), 401
            
        payload = decode_jwt(token, Config.SECRET_KEY)
        if not payload:
            return jsonify({"message": "Token is invalid or expired!"}), 401
            
        # Get active user from database
        conn = get_db_connection()
        user = conn.execute(
            "SELECT id, username, email, phone, is_admin, created_at FROM users WHERE id = ?",
            (payload['user_id'],)
        ).fetchone()
        conn.close()
        
        if not user:
            return jsonify({"message": "User not found!"}), 401
            
        # Add current_user as a dict to request context
        request.current_user = dict(user)
        return f(*args, **kwargs)
        
    return decorated

def admin_required(f):
    """Decorator ensuring that the authenticated user is an administrator."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if not request.current_user.get('is_admin'):
            return jsonify({"message": "Administrator permission required!"}), 403
        return f(*args, **kwargs)
        
    return decorated
