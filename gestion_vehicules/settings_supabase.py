"""
Configuration Django pour Supabase PostgreSQL
"""

import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Importer les paramètres de base
from .settings import *

# Configuration Supabase PostgreSQL avec pooler
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres.ruejckvikpewirrfzfhy',
        'PASSWORD': os.getenv('SUPABASE_DB_PASSWORD', 'ALcX66APUxYltilK'),
        'HOST': os.getenv('SUPABASE_POOLER_HOST', 'aws-0-eu-north-1.pooler.supabase.com'),
        'PORT': '6543',
        'OPTIONS': {
            'sslmode': 'require',
        },
        'CONN_MAX_AGE': 600,
    }
}

DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

print(f"✅ Configuration Supabase Pooler: {DATABASES['default']['HOST']}:{DATABASES['default']['PORT']}")