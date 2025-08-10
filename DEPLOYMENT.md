# 🚀 Guide de Déploiement - Timesheet Web Secure

Ce guide détaille les différentes méthodes de déploiement de votre application Timesheet Web Secure.

## 📋 Prérequis

- ✅ Git installé et configuré
- ✅ Compte GitHub avec accès au repository [POINTAGEWEB](https://github.com/ASOFES/POINTAGEWEB)
- ✅ Node.js 18+ (pour le développement local)

## 🏠 Déploiement Local

### Option 1: Serveur HTTP Simple
```bash
# Installer http-server globalement
npm install -g http-server

# Démarrer le serveur
http-server . -p 8000 -c-1

# Ouvrir http://localhost:8000
```

### Option 2: Script de Déploiement
```bash
# Rendre le script exécutable (Linux/Mac)
chmod +x deploy.sh

# Déploiement local
./deploy.sh --local

# Ou simplement
./deploy.sh
```

### Option 3: Python (si disponible)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

## 🌐 GitHub Pages

### Déploiement Automatique (Recommandé)

1. **Vérifier la Configuration**
   - Le fichier `.github/workflows/deploy.yml` est déjà configuré
   - GitHub Actions se déclenche automatiquement sur push vers `main`

2. **Activer GitHub Pages**
   - Aller dans Settings > Pages
   - Source: "GitHub Actions"

3. **Déployer**
   ```bash
   git add .
   git commit -m "🚀 Version 2.0.0 - Configuration complète"
   git push origin main
   ```

4. **Vérifier le Déploiement**
   - Aller dans Actions pour voir le statut
   - Le site sera disponible sur `https://asofes.github.io/POINTAGEWEB`

### Déploiement Manuel
```bash
# Cloner le repository
git clone https://github.com/ASOFES/POINTAGEWEB.git
cd POINTAGEWEB

# Créer la branche gh-pages
git checkout -b gh-pages

# Pousser vers GitHub
git push origin gh-pages
```

## 🚀 Netlify

### Option 1: Drag & Drop (Rapide)
1. Aller sur [netlify.com](https://netlify.com)
2. Glisser-déposer le dossier du projet
3. Le site sera déployé automatiquement

### Option 2: Déploiement Git (Recommandé)
1. **Connecter le Repository**
   - "New site from Git"
   - Choisir GitHub > POINTAGEWEB
   - Branche: `main`

2. **Configuration Build**
   - Build command: `echo "Build completed"`
   - Publish directory: `.`

3. **Variables d'Environnement**
   ```env
   NODE_ENV=production
   ```

4. **Déployer**
   - Netlify déploiera automatiquement à chaque push

### Configuration Netlify
Le fichier `netlify.toml` est déjà configuré avec :
- Headers de sécurité
- Redirections SPA
- Cache optimisé
- CSP approprié

## ⚡ Vercel

### Déploiement Instantané
1. **Installer Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Déployer**
   ```bash
   vercel --prod
   ```

3. **Configuration**
   - Le fichier `vercel.json` est déjà configuré
   - Vercel détecte automatiquement la configuration

### Déploiement Git
1. Connecter le repository GitHub
2. Vercel déploiera automatiquement sur chaque push
3. Prévisualisations automatiques sur les PR

## 🖥️ Serveur Web Classique

### Apache
1. **Copier les Fichiers**
   ```bash
   sudo cp -r . /var/www/html/timesheet-web-secure/
   sudo chown -R www-data:www-data /var/www/html/timesheet-web-secure/
   ```

2. **Configuration .htaccess**
   - Le fichier `.htaccess` est généré automatiquement par `deploy.sh`
   - Ou créer manuellement selon le modèle dans le script

### Nginx
1. **Copier les Fichiers**
   ```bash
   sudo cp -r . /var/www/timesheet-web-secure/
   sudo chown -R www-data:www-data /var/www/timesheet-web-secure/
   ```

2. **Configuration Nginx**
   - Le fichier `nginx.conf` est généré automatiquement
   - Copier dans `/etc/nginx/sites-available/`
   - Activer le site

### Script de Déploiement
```bash
# Déploiement local
./deploy.sh --local

# Déploiement distant
./deploy.sh user@server.com
```

## 🔧 Configuration Avancée

### Variables d'Environnement
```bash
# Production
NODE_ENV=production
API_BASE_URL=https://timesheetapp.azurewebsites.net/api

# Développement
NODE_ENV=development
API_BASE_URL=http://localhost:5000/api
```

### Headers de Sécurité
Tous les déploiements incluent automatiquement :
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` approprié

### Cache et Performance
- **Ressources statiques** : Cache 1 an
- **Fichiers HTML** : Pas de cache
- **Compression** : Activée automatiquement

## 📱 PWA (Progressive Web App)

### Manifest
```json
{
  "name": "Timesheet Secure",
  "short_name": "Timesheet",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#3b82f6"
}
```

### Service Worker
- Cache des ressources statiques
- Mode hors ligne basique
- Mise à jour automatique

## 🔍 Vérification du Déploiement

### Tests de Base
1. **Page d'accueil** : Chargement correct
2. **Authentification** : Connexion fonctionnelle
3. **Scanner QR** : Accès caméra
4. **API** : Communication avec le serveur

### Tests de Sécurité
1. **HTTPS** : Connexion sécurisée
2. **Headers** : Présence des headers de sécurité
3. **CSP** : Politique de sécurité du contenu
4. **CORS** : Configuration appropriée

### Tests de Performance
1. **Lighthouse** : Score > 90
2. **PageSpeed** : Temps de chargement < 3s
3. **Mobile** : Responsive design

## 🚨 Dépannage

### Erreurs Communes
- **Caméra non accessible** : Vérifier HTTPS
- **Erreurs API** : Vérifier l'URL et la connectivité
- **Problèmes de cache** : Vider le cache navigateur

### Logs et Debug
```bash
# Console navigateur
F12 > Console

# Logs serveur
tail -f /var/log/apache2/error.log
tail -f /var/log/nginx/error.log
```

## 📊 Monitoring

### Métriques à Surveiller
- Temps de réponse API
- Taux d'erreur
- Utilisation de la caméra
- Performance mobile

### Outils Recommandés
- **Google Analytics** : Trafic et comportement
- **Sentry** : Gestion des erreurs
- **Uptime Robot** : Monitoring de disponibilité

## 🔄 Mise à Jour

### Processus de Mise à Jour
1. **Développement** : Branche feature
2. **Test** : Pull Request
3. **Déploiement** : Merge automatique
4. **Vérification** : Tests post-déploiement

### Rollback
```bash
# Revenir à une version précédente
git revert HEAD
git push origin main

# Ou utiliser les fonctionnalités de rollback des plateformes
```

---

**💡 Conseil** : Commencez par le déploiement local pour tester, puis utilisez GitHub Pages pour la production. C'est gratuit et automatique !

**📞 Support** : En cas de problème, créer une issue sur GitHub ou contacter totoasofes22@gmail.com
