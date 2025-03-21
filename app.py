from flask import Flask, jsonify, render_template
from config import Config
from models import db, Report
from official import get_official_data
from notifications import send_sms_notification, notify_operator, notify_amazonas_official
from datetime import datetime
import os

from scraper import scrape_amazonas_noticias  # Importa o scraper

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/amazonas-news', methods=['GET'])
def amazonas_news():
    noticias = scrape_amazonas_noticias()
    return jsonify(noticias)

# Outras rotas (predict, user-report, etc.) seguem aqui...

if __name__ == '__main__':
    app.run(debug=True)
