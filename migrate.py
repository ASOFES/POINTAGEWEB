#!/usr/bin/env python
"""
Script pour exécuter les migrations Django en production
"""
import os
import django
from django.core.management import execute_from_command_line
from django.contrib.auth import get_user_model

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gestion_vehicules.settings')
    django.setup()
    
    # Exécuter les migrations
    print("🔄 Exécution des migrations...")
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Créer le superutilisateur si nécessaire
    User = get_user_model()
    if not User.objects.filter(username='admin').exists():
        print("👤 Création du superutilisateur...")
        User.objects.create_superuser(
            username='admin',
            email='admin@ipsco.com',
            password='admin123'
        )
        print("✅ Superutilisateur créé !")
    else:
        print("ℹ️  Superutilisateur existe déjà")
    
    print("🎉 Configuration terminée !")
