
from app.extensions import db
from datetime import datetime, timezone


def now_utc():
    return datetime.now(timezone.utc)


class Building(db.Model):
    __tablename__ = 'buildings'

    # ─── Columns ──────────────────────────────────────────────
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(255), nullable=False)
    address    = db.Column(db.String(500), nullable=False)
    floors     = db.Column(db.Integer, nullable=True)
    units      = db.Column(db.Integer, nullable=True)
    complex_id = db.Column(db.Integer, db.ForeignKey('residential_complexes.id'), nullable=False)
    admin_id   = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    # ─── Serialization ────────────────────────────────────────
    def to_dict(self):
        return {
            'id':           self.id,
            'name':         self.name,
            'address':      self.address,
            'floors':       self.floors,
            'units':        self.units,
            'complex_id':   self.complex_id,
            'complex_name': self.complex.name if self.complex else None,
            'admin_id':     self.admin_id,
            'admin':        self.admin.to_dict() if self.admin else None,
            'created_at':   self.created_at.isoformat() if self.created_at else None,
            'updated_at':   self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<Building {self.name} (Complex ID: {self.complex_id})>'