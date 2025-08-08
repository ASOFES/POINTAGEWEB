"""
WSGI config for ipsco_app project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Utiliser les settings de production pour le déploiement
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ipsco_app.settings_production')

application = get_wsgi_application()
