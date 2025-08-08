# 🚀 Guide de Déploiement Rapide

## 📋 Prérequis

- Compte GitHub
- Serveur web avec HTTPS (ou service de déploiement)
- API backend configurée

## 🔧 Configuration Rapide

### 1. Configuration de l'API

Modifiez le fichier `auth.js` ligne 3 :
```javascript
this.API_BASE_URL = 'https://votre-api-domain.com/api';
```

### 2. Test Local

```bash
# Démarrer un serveur local HTTPS
python -m http.server 8000 --bind 0.0.0.0

# Ou avec Node.js
npx http-server -p 8000 --ssl
```

Accédez à `https://localhost:8000`

## 🌐 Déploiement sur GitHub Pages

### Étape 1 : Préparer le repository

```bash
# Initialiser Git
git init
git add .
git commit -m "Initial commit"

# Ajouter le remote
git remote add origin https://github.com/ASOFES/POINTAGEWEB.git
git push -u origin main
```

### Étape 2 : Activer GitHub Pages

1. Aller sur GitHub → Settings → Pages
2. Source : "Deploy from a branch"
3. Branch : `main`
4. Folder : `/ (root)`
5. Cliquer "Save"

### Étape 3 : Vérifier le déploiement

L'application sera disponible à :
`https://asofes.github.io/POINTAGEWEB`

## 🚀 Déploiement sur Vercel

### Étape 1 : Connecter GitHub

1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Cliquer "New Project"
4. Sélectionner le repository `POINTAGEWEB`

### Étape 2 : Configuration

- Framework Preset : `Other`
- Root Directory : `./`
- Build Command : (laisser vide)
- Output Directory : (laisser vide)

### Étape 3 : Déployer

Cliquer "Deploy" - l'application sera déployée automatiquement.

## 🌐 Déploiement sur Netlify

### Étape 1 : Upload

1. Aller sur [netlify.com](https://netlify.com)
2. Glisser-déposer le dossier du projet
3. Attendre le déploiement

### Étape 2 : Configuration

- Site name : `pointageweb`
- URL : `https://pointageweb.netlify.app`

## 🔒 Configuration HTTPS

### Certificat SSL automatique

La plupart des services (GitHub Pages, Vercel, Netlify) fournissent automatiquement HTTPS.

### Certificat manuel

```bash
# Générer un certificat auto-signé pour les tests
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

## 🧪 Test du Déploiement

### 1. Vérifier l'accès
- Ouvrir l'URL de déploiement
- Vérifier que la page de connexion s'affiche

### 2. Tester l'authentification
- Utiliser les comptes de démonstration
- Vérifier la redirection vers le tableau de bord

### 3. Tester le scanner QR
- Aller sur l'onglet "Scanner QR"
- Autoriser la caméra
- Scanner un QR code de test

## 🐛 Dépannage

### Erreur 404
- Vérifier que tous les fichiers sont uploadés
- Contrôler les noms de fichiers (sensible à la casse)

### Erreur CORS
- Vérifier que l'API autorise les requêtes depuis le domaine
- Ajouter les headers CORS appropriés

### Caméra non accessible
- Vérifier que le site est en HTTPS
- Tester sur un autre navigateur
- Vérifier les permissions du navigateur

## 📱 Test Mobile

### 1. Accès mobile
- Ouvrir l'URL sur un smartphone
- Vérifier que l'interface s'adapte

### 2. Test caméra
- Autoriser l'accès à la caméra
- Scanner un QR code réel
- Vérifier l'enregistrement du pointage

### 3. Test responsive
- Tester sur différentes tailles d'écran
- Vérifier la navigation par onglets

## 🔄 Mise à jour

### GitHub Pages
```bash
git add .
git commit -m "Update application"
git push origin main
```

### Vercel/Netlify
- Mise à jour automatique lors du push sur GitHub

## 📊 Monitoring

### Analytics
- Ajouter Google Analytics
- Surveiller les erreurs console
- Tester régulièrement les fonctionnalités

### Performance
- Optimiser les images
- Minifier le CSS/JS
- Utiliser un CDN si nécessaire

---

**✅ Déploiement terminé !**

Votre application TimeSheet est maintenant accessible en ligne avec support HTTPS pour le scanner QR.
