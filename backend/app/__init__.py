from flask import Flask, jsonify
from app.config import Config
# Added 'jwt' assuming you've defined it in your extensions file now
from app.extensions import db, migrate, bcrypt, cors, jwt 

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ─── Initialize Extensions ────────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # ─── Debug JWT Errors ─────────────────────────────────────
    # ─── Debug JWT Errors ─────────────────────────────────────
    @jwt.invalid_token_loader
    @jwt.unauthorized_loader
    @jwt.expired_token_loader
    def debug_jwt_errors(*args):
        # *args dynamically catches 1 argument for invalid/unauthorized
        # and 2 arguments (header, data) for expired tokens.
        
        print("\n=== 🚨 JWT DEBUG ERROR ===")
        for i, arg in enumerate(args):
            print(f"Argument {i+1}: {arg}")
        print("===========================\n")
        
        # Safely extract a readable message string regardless of which error occurred
        if len(args) == 2:
            # It's an expired token error: args[0] is header, args[1] is data payload
            message = f"JWT Error: Token expired at {args[1].get('exp')}"
        else:
            # It's invalid or unauthorized: args[0] is an error string description
            message = f"JWT Error: {str(args[0])}"
        
        return jsonify({
            "success": False,
            "message": message
        }), 401
    
    # Initialize JWT (if your auth routes are using it)
    # jwt.init_app(app) 

    

    # ─── Register Models ──────────────────────────────────────
    # Must be imported so Flask-Migrate can detect them
    from app.models import admin, complex, building  # noqa: F401

    # ─── Register Blueprints ──────────────────────────────────
    from app.routes.auth import auth_bp
    from app.routes.admins import admins_bp
    from app.routes.complexes import complexes_bp
    from app.routes.buildings import buildings_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(admins_bp)
    app.register_blueprint(complexes_bp)
    app.register_blueprint(buildings_bp)

    # Keep your centralized 'cors' extension instance and drop the raw CORS(app)
    cors.init_app(app, resources={
        r"/*": {
            "origins": "http://localhost:4200",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    @app.route('/')
    def home():
        return {"status": "online", "message": "Flask & MySQL API is running smoothly!"}

    return app