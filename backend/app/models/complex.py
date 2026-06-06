
from app.extensions import db
from datetime import datetime, timezone


def now_utc():
    return datetime.now(timezone.utc)


class ResidentialComplex(db.Model):
    __tablename__ = 'residential_complexes'

    # ─── Columns ──────────────────────────────────────────────
    id                  = db.Column(db.Integer, primary_key=True)
    name                = db.Column(db.String(255), nullable=False)
    address             = db.Column(db.String(500), nullable=False)
    city                = db.Column(db.String(100), nullable=False)
    postal_code         = db.Column(db.String(20), nullable=True)
    campaign_name       = db.Column(db.String(255), nullable=True)
    campaign_start_date = db.Column(db.Date, nullable=True)
    campaign_end_date   = db.Column(db.Date, nullable=True)
    admin_id            = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=True)
    created_at          = db.Column(db.DateTime(timezone=True), default=now_utc, nullable=False)
    updated_at          = db.Column(db.DateTime(timezone=True), default=now_utc, onupdate=now_utc, nullable=False)

    # ─── Relationships ────────────────────────────────────────
    buildings = db.relationship(
                    'Building',
                    backref='complex',
                    lazy='dynamic',          # Query on access, not on load
                    cascade='all, delete-orphan'
                )

    # ─── Serialization ────────────────────────────────────────
    def to_dict(self, include_buildings=False):
        data = {
            'id':                  self.id,
            'name':                self.name,
            'address':             self.address,
            'city':                self.city,
            'postal_code':         self.postal_code,
            'campaign_name':       self.campaign_name,
            'campaign_start_date': self.campaign_start_date.isoformat() if self.campaign_start_date else None,
            'campaign_end_date':   self.campaign_end_date.isoformat() if self.campaign_end_date else None,
            'admin_id':            self.admin_id,
            'admin':               self.admin.to_dict() if self.admin else None,
            'created_at':          self.created_at.isoformat() if self.created_at else None,
            'updated_at':          self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_buildings:
            data['buildings'] = [b.to_dict() for b in self.buildings]

        return data

    def __repr__(self):
        return f'<ResidentialComplex {self.name} ({self.city})>'