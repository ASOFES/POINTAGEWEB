"""
Configuration Django pour Supabase PostgreSQL - Production
"""

import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Importer les paramètres de base
from .settings import *

# Remplacer la configuration de base de données
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres.ruejckvikpewirrfzfhy',
        'PASSWORD': 'ALcX66APUxYltilK',
        'HOST': 'aws-0-eu-north-1.pooler.supabase.com',
        'PORT': '6543',
        'OPTIONS': {
            'sslmode': 'require',
        },
        'CONN_MAX_AGE': 600,
    }
}

# Configuration pour la production
DEBUG = True  # True pour le développement
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*.supabase.co']

# Configuration des fichiers statiques
STATIC_ROOT = BASE_DIR / 'staticfiles'

print(f"✅ Configuration Supabase PostgreSQL activée")
print(f"🔗 Host: {DATABASES['default']['HOST']}:{DATABASES['default']['PORT']}")
print(f"👤 User: {DATABASES['default']['USER']}")
print(f"📊 Database: {DATABASES['default']['NAME']}")