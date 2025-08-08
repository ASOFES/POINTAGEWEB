# TimeSheet Employee App - Web Mobile

## 📱 Description

Application web mobile pour la gestion des pointages employés, conforme au style de l'APK Flutter existant. Cette version web permet aux employés de scanner des QR codes pour pointer leur entrée/sortie directement depuis leur navigateur mobile.

## ✨ Fonctionnalités

### 🔐 Authentification
- Page de connexion sécurisée
- Gestion des tokens JWT
- Validation automatique des sessions
- Comptes de démonstration inclus

### 📷 Scanner QR
- Scanner QR code avec la caméra mobile
- Support HTTPS obligatoire pour la caméra
- Détection automatique des codes QR
- Validation des pointages en temps réel

### 📊 Tableau de bord
- Interface moderne et responsive
- Navigation par onglets
- Actions principales en cartes
- Affichage des pointages récents

### 📈 Historique
- Liste des pointages avec filtres
- Export CSV des données
- Actualisation en temps réel
- Statistiques des heures travaillées

### 👤 Profil utilisateur
- Informations personnelles
- Gestion des données utilisateur
- Déconnexion sécurisée

## 🚀 Installation

### Prérequis
- Serveur web avec support HTTPS
- API backend pour l'authentification et les pointages
- Navigateur moderne avec support WebRTC

### Configuration

1. **Cloner le repository**
```bash
git clone https://github.com/ASOFES/POINTAGEWEB.git
cd POINTAGEWEB
```

2. **Configurer l'API**
Modifiez le fichier `auth.js` et remplacez l'URL de l'API :
```javascript
this.API_BASE_URL = 'https://votre-api-domain.com/api';
```

3. **Déployer sur un serveur HTTPS**
```bash
# Exemple avec un serveur local HTTPS
python -m http.server 8000 --bind 0.0.0.0
# Ou utiliser un serveur comme nginx, Apache, etc.
```

## 📁 Structure des fichiers

```
POINTAGEWEB/
├── index.html          # Page principale de l'application
├── login.html          # Page de connexion
├── auth.js             # Gestion de l'authentification
├── app.js              # Logique principale de l'application
├── README.md           # Documentation
└── .gitignore          # Fichiers à ignorer
```

## 🔧 Configuration API

### Endpoints requis

#### Authentification
- `POST /Auth/login` - Connexion utilisateur
- `GET /Auth/validate` - Validation du token

#### Pointages
- `POST /Timesheet` - Créer un pointage
- `GET /Timesheet` - Récupérer l'historique

### Format des données

#### Login
```json
{
  "Email": "user@example.com",
  "password": "password123"
}
```

#### Pointage
```json
{
  "code": "QR_CODE_DATA",
  "details": "Pointage entrée",
  "start": "2024-01-15T08:00:00Z",
  "planningId": 5,
  "timesheetTypeId": 1
}
```

## 📱 Utilisation

### 1. Accès à l'application
- Ouvrir `https://votre-domaine.com` dans un navigateur mobile
- Se connecter avec ses identifiants

### 2. Scanner un QR code
- Aller dans l'onglet "Scanner QR"
- Autoriser l'accès à la caméra
- Pointer le QR code dans le cadre
- Le pointage est automatiquement enregistré

### 3. Consulter l'historique
- Aller dans l'onglet "Historique"
- Voir tous ses pointages
- Exporter les données en CSV

## 🛡️ Sécurité

### HTTPS obligatoire
- L'application nécessite HTTPS pour accéder à la caméra
- Fonctionne en localhost pour les tests

### Authentification
- Tokens JWT pour la sécurité
- Validation automatique des sessions
- Déconnexion automatique si token expiré

### Permissions caméra
- Demande explicite des permissions
- Gestion des erreurs de permissions
- Messages d'aide pour l'utilisateur

## 🎨 Design

### Style conforme à l'APK Flutter
- Couleurs : #1976D2 (bleu principal)
- Interface moderne avec animations
- Responsive design pour mobile
- Navigation intuitive

### Composants
- Cartes d'actions principales
- Navigation par onglets
- Messages de statut colorés
- Indicateurs de chargement

## 🧪 Tests

### Comptes de démonstration
- `test@test.com` / `test`
- `admin@example.com` / `admin123`
- `user@example.com` / `user123`

### Test du scanner
- Utiliser des QR codes de test
- Vérifier les permissions caméra
- Tester sur différents appareils

## 🔄 Déploiement

### GitHub Pages
1. Pousser le code sur GitHub
2. Activer GitHub Pages dans les paramètres
3. L'application sera accessible via `https://username.github.io/POINTAGEWEB`

### Vercel
1. Connecter le repository GitHub à Vercel
2. Déployer automatiquement
3. URL personnalisée disponible

### Netlify
1. Drag & drop du dossier sur Netlify
2. Configuration automatique
3. URL personnalisée disponible

## 🐛 Dépannage

### Problèmes courants

#### Caméra non accessible
- Vérifier que le site est en HTTPS
- Autoriser les permissions caméra
- Tester sur un autre navigateur

#### Erreur de connexion API
- Vérifier l'URL de l'API dans `auth.js`
- Contrôler la connectivité réseau
- Vérifier les logs du serveur

#### Scanner QR ne fonctionne pas
- Vérifier que la bibliothèque est chargée
- Contrôler les permissions caméra
- Tester avec un QR code valide

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation de l'API

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

**Développé avec ❤️ pour ASOFES**
