
from app.extensions import db
from datetime import datetime, timezone


def now_utc():
    """Consistent UTC timestamp for all models"""
    return datetime.now(timezone.utc)


class Admin(db.Model):
    __tablename__ = 'admins'

    # ─── Columns ──────────────────────────────────────────────
    id            = db.Column(db.Integer, primary_key=True)
    civility      = db.Column(
                        db.Enum('Mr', 'Mrs', 'Ms', 'Dr', 'Prof', name='civility_enum'),
                        nullable=False
                    )
    first_name    = db.Column(db.String(100), nullable=False)
    last_name     = db.Column(db.String(100), nullable=False)
    email         = db.Column(db.String(255), nullable=False, unique=True, index=True)
    phone         = db.Column(db.String(20), nullable=True, unique=True)
    role          = db.Column(
                        db.Enum(
                            'super_admin',
                            'complex_admin',
                            'building_admin',
                            name='role_enum'
                        ),
                        nullable=False,
                        default='building_admin'
                    )
    status        = db.Column(
                        db.Enum('active', 'inactive', name='status_enum'),
                        nullable=False,
                        default='active'
                    )
    password_hash = db.Column(db.String(255), nullable=False)
    created_at    = db.Column(db.DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at    = db.Column(db.DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    # ─── Relationships ────────────────────────────────────────
    managed_complexs  = db.relationship(
                           'ResidentialComplex',
                           backref='admin',
                          
                           lazy='select'
                       )
    managed_buildings = db.relationship(
                           'Building',
                           backref='admin',
                          
                           lazy='select'
                       )

    # ─── Serialization ────────────────────────────────────────
    def to_dict(self):
        return {
            'id':         self.id,
            'civility':   self.civility,
            'first_name': self.first_name,
            'last_name':  self.last_name,
            'email':      self.email,
            'phone':      self.phone,
            'role':       self.role,
            'status':     self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<Admin {self.email} ({self.role})>'