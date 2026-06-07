from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os

from backend.config import Config
from backend.database.db import init_db
from backend.routes.auth import auth_bp
from backend.routes.properties import properties_bp
from backend.routes.messages import messages_bp
from backend.routes.favorites import favorites_bp
from backend.routes.admin import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for the frontend development server
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Serve uploaded images statically
    @app.route('/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(properties_bp, url_prefix='/api/properties')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(favorites_bp, url_prefix='/api/favorites')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Health Check API
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "service": "EstateElite API"}), 200

    # Handle 404
    @app.errorhandler(404)
    def page_not_found(e):
        return jsonify({"message": "Resource not found"}), 404

    # Handle 500
    @app.errorhandler(500)
    def internal_server_error(e):
        return jsonify({"message": "Internal server error occurred", "error": str(e)}), 500

    # Initialize Database
    try:
        init_db()
    except Exception as e:
        print(f"Error initializing database: {e}")

    return app

app = create_app()

if __name__ == '__main__':
    # Launch on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
