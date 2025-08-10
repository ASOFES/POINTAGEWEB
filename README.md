# 📱 Timesheet App - Version Web Multi-Pages

Application web moderne de gestion de pointage par QR code avec interface multi-pages et design responsive.

## 🚀 Fonctionnalités

### ✅ Authentification Sécurisée
- Page de connexion dédiée
- Gestion des tokens JWT
- Protection des routes
- Validation des identifiants

### 📷 Scanner QR Code
- Scanner intégré avec `html5-qrcode`
- Protection anti-scan multiple
- Validation cross-utilisateur
- Arrêt automatique de la caméra
- Messages de succès/erreur clairs
- Indicateurs de statut GPS et Caméra

### 📊 Tableau de Bord
- Vue d'ensemble des statistiques
- Navigation vers toutes les fonctionnalités
- Informations utilisateur
- Activité récente

### 📋 Historique des Pointages
- Filtres avancés (date, type, site)
- Tableau paginé
- Export CSV
- Statistiques détaillées

### 👤 Profil Utilisateur
- Informations personnelles
- Statistiques de pointage
- Actions de gestion
- Déconnexion sécurisée

## 🛠️ Technologies Utilisées

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Scanner QR**: html5-qrcode v2.3.8
- **API**: Azure Web App (REST)
- **Stockage**: localStorage pour la session
- **Design**: CSS Grid, Flexbox, Responsive Design

## 📁 Structure des Fichiers

```
timesheet-web-secure/
├── login.html          # Page de connexion
├── dashboard.html      # Tableau de bord principal
├── scanner.html        # Scanner QR code
├── history.html        # Historique des pointages
├── profile.html        # Profil utilisateur
├── index.html          # Page d'accueil/redirection
├── auth.js             # Logique d'authentification
├── app.js              # Fonctionnalités principales
└── README.md           # Documentation
```

## 🔧 Installation et Utilisation

### 1. Cloner le Repository
```bash
git clone https://github.com/ASOFES/POINTAGEWEB.git
cd POINTAGEWEB
```

### 2. Ouvrir l'Application
- Ouvrir `index.html` dans un navigateur moderne
- Ou déployer sur un serveur web statique

### 3. Se Connecter
- Utiliser les identifiants fournis
- L'application redirigera automatiquement vers le tableau de bord

## 🔐 Sécurité

### Protection Anti-Duplication
- Vérification des QR codes déjà utilisés
- Protection contre les scans multiples
- Validation cross-utilisateur des QR codes

### Authentification
- Tokens JWT sécurisés
- Vérification de session à chaque page
- Redirection automatique si non connecté

## 📱 Compatibilité

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Android, Samsung Internet
- **Navigateurs anciens**: Fallbacks CSS et JavaScript inclus

## 🌐 Déploiement

### Netlify (Recommandé)
1. Connecter le repository GitHub
2. Build automatique à chaque push
3. HTTPS et CDN inclus

### GitHub Pages
1. Activer GitHub Pages dans les paramètres
2. Sélectionner la branche `main`
3. Accès via `https://username.github.io/repository`

## 🔍 Dépannage

### Problèmes de Scanner
- Vérifier les permissions caméra
- Actualiser la page si nécessaire
- Vérifier la connexion internet

### Problèmes de Connexion
- Vérifier les identifiants
- Vider le cache du navigateur
- Vérifier l'accessibilité de l'API

## 📞 Support

Pour toute question ou problème :
1. Vérifier la console du navigateur
2. Consulter les logs de l'API
3. Contacter l'équipe de développement

## 🔄 Mises à Jour

L'application est régulièrement mise à jour avec :
- Corrections de bugs
- Améliorations de sécurité
- Nouvelles fonctionnalités
- Optimisations de performance

---

**Version**: 2.0.0  
**Dernière mise à jour**: Août 2025  
**Statut**: Production Ready ✅
