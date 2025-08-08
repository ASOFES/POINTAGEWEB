# 🚀 Guide de Déploiement IPSCO - Gestion de Véhicules

## 📋 Prérequis
- Compte GitHub
- Compte Railway (https://railway.app)
- Compte Vercel (https://vercel.com)
- Base de données Supabase configurée

## 🚂 Déploiement sur Railway

### 1. Initialiser Git (si pas déjà fait)
```bash
git init
git add .
git commit -m "Initial commit - IPSCO Vehicle Management"
```

### 2. Pousser vers GitHub
```bash
git remote add origin https://github.com/VOTRE_USERNAME/ipsco-vehicules.git
git branch -M main
git push -u origin main
```

### 3. Déployer sur Railway
1. Aller sur https://railway.app
2. Connecter votre compte GitHub
3. Cliquer sur "New Project"
4. Sélectionner "Deploy from GitHub repo"
5. Choisir votre repository `ipsco-vehicules`
6. Railway détectera automatiquement que c'est un projet Django

### 4. Variables d'environnement Railway
Dans le dashboard Railway, aller dans l'onglet "Variables" et ajouter :
```
DJANGO_SETTINGS_MODULE=ipsco_app.settings_production
DATABASE_URL=postgresql://postgres.ruejckvikpewirrfzfhy:ALcX66APUxYltilK@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require
SECRET_KEY=votre-cle-secrete-super-longue-et-complexe
DEBUG=False
```

### 5. Configuration finale Railway
- Railway va automatiquement installer les dépendances et démarrer l'application
- Votre application sera disponible sur une URL comme : `https://ipsco-vehicules-production.up.railway.app`

## ▲ Déploiement sur Vercel

### 1. Installer Vercel CLI
```bash
npm install -g vercel
```

### 2. Déployer depuis votre répertoire
```bash
vercel
```

### 3. Configuration Vercel
Lors du déploiement, Vercel vous demandera :
- Project name : `ipsco-vehicules`
- Directory : laisser vide (répertoire actuel)
- Settings : confirmer les détections automatiques

### 4. Variables d'environnement Vercel
Dans le dashboard Vercel (https://vercel.com/dashboard), aller dans votre projet :
1. Settings → Environment Variables
2. Ajouter :
```
DJANGO_SETTINGS_MODULE=ipsco_app.settings_production
DATABASE_URL=postgresql://postgres.ruejckvikpewirrfzfhy:ALcX66APUxYltilK@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=require
SECRET_KEY=votre-cle-secrete-super-longue-et-complexe
DEBUG=False
```

### 5. Redéploiement
```bash
vercel --prod
```

## 🔧 Post-déploiement

### Créer un superutilisateur en production
Pour Railway :
```bash
railway run python manage.py createsuperuser
```

Pour Vercel (utiliser un script local connecté à la prod) :
```bash
python manage.py createsuperuser --settings=ipsco_app.settings_production
```

## 🔗 URLs d'accès

### Railway
- Application : `https://votre-app.up.railway.app`
- Admin Django : `https://votre-app.up.railway.app/admin/`

### Vercel  
- Application : `https://ipsco-vehicules.vercel.app`
- Admin Django : `https://ipsco-vehicules.vercel.app/admin/`

## 🔒 Sécurité

### Clé secrète Django
Générer une nouvelle clé secrète pour la production :
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### Variables d'environnement
⚠️ **IMPORTANT** : Ne jamais commiter les vraies variables d'environnement dans Git !

## 🐛 Dépannage

### Erreurs communes
1. **Erreur de migration** : Assurer que Supabase est accessible
2. **Erreur 500** : Vérifier les variables d'environnement
3. **Fichiers statiques** : Vérifier la configuration WhiteNoise

### Logs
- Railway : Dashboard → Deployments → View logs
- Vercel : Dashboard → Functions → View logs

## ✅ Checklist de déploiement
- [ ] Code pushé sur GitHub
- [ ] Variables d'environnement configurées
- [ ] Base de données Supabase accessible
- [ ] Migrations appliquées
- [ ] Superutilisateur créé
- [ ] Interface admin accessible
- [ ] Tests fonctionnels sur l'URL de production
