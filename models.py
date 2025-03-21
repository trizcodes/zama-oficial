from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(256))
    neighborhood = db.Column(db.String(128))
    datetime_reported = db.Column(db.DateTime, default=datetime.utcnow)
    date_str = db.Column(db.String(10))  # formato YYYY-MM-DD
    status = db.Column(db.String(64))    # ex.: "APAGÃO" ou "SEM INTERNET"

    def as_dict(self):
        return {
            'id': self.id,
            'address': self.address,
            'neighborhood': self.neighborhood,
            'datetime_reported': self.datetime_reported.isoformat(),
            'date_str': self.date_str,
            'status': self.status
        }