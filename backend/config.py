import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'estate_elite_ultra_secure_secret_key_123987')
    # JWT expiration time (in seconds - e.g. 7 days)
    JWT_EXPIRY = 60 * 60 * 24 * 7
    
    # Configure physical folder for uploading listing images
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    
    # Allowed formats for uploads
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
    
    # Ensure upload folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
