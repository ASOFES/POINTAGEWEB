"""
Configuration Django pour la production (Railway/Vercel)
"""

import os
import dj_database_url
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Importer les paramètres de base
from .settings import *

# Configuration pour la production
DEBUG = False
ALLOWED_HOSTS = [
    '.railway.app',
    '.vercel.app', 
    'localhost',
    '127.0.0.1',
    'ipsco-vehicules.railway.app',
    'ipsco-vehicules.vercel.app'
]

# Configuration de base de données avec dj-database-url
# Railway et Vercel utiliseront la variable d'environnement DATABASE_URL
DATABASES = {
    'default': dj_database_url.config(
        default=f"postgresql://postgres.ruejckvikpewirrfzfhy:ALcX66APUxYltilK@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require",
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Configuration des fichiers statiques
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Middleware avec WhiteNoise pour les fichiers statiques
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Pour les fichiers statiques
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configuration de sécurité pour la production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Configuration CSRF pour les domaines de production
CSRF_TRUSTED_ORIGINS = [
    'https://*.railway.app',
    'https://*.vercel.app',
]

# Configuration de logging pour la production
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
    },
}

print(f"✅ Configuration de production activée")
print(f"🌐 Hosts autorisés: {ALLOWED_HOSTS}")
print(f"🔗 Database: {DATABASES['default']['NAME']} sur {DATABASES['default']['HOST']}")
