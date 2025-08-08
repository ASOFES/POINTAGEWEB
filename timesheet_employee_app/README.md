# TimeSheet Employee App

Application Flutter pour les employés permettant de scanner des QR codes et effectuer des pointages.

## 🚀 Fonctionnalités

- ✅ **Authentification sécurisée** avec JWT
- ✅ **Scanner QR codes** pour le pointage
- ✅ **Géolocalisation** pour vérifier la présence
- ✅ **Interface utilisateur moderne** et intuitive
- ✅ **Gestion des erreurs** et notifications
- ✅ **Profil utilisateur** avec informations détaillées

## 📱 Écrans

### 1. Écran de Connexion
- Interface de connexion avec identifiants de test
- Validation des champs
- Gestion des erreurs de connexion

### 2. Dashboard Principal
- Informations de l'utilisateur connecté
- Actions principales (Scanner QR, Historique)
- Pointages récents

### 3. Scanner QR
- Scanner de QR codes avec caméra
- Géolocalisation automatique
- Traitement des données QR
- Création de pointages

### 4. Profil Utilisateur
- Informations personnelles de l'employé
- Actions (Historique, Paramètres, Aide, Déconnexion)

## 🔧 Configuration

### Identifiants de Test
```
Email: Test@test.com
Mot de passe: test123
```

### Backend API
- URL: `https://timesheetapp.azurewebsites.net/api`
- Authentification: JWT Token
- Endpoints testés et fonctionnels

## 📦 Dépendances

- **HTTP & API**: `http`, `dio`
- **Gestion d'état**: `provider`
- **Stockage local**: `shared_preferences`
- **Scanner QR**: `qr_code_scanner`
- **Géolocalisation**: `geolocator`
- **Permissions**: `permission_handler`
- **UI Components**: `flutter_svg`, `cached_network_image`
- **Utilitaires**: `intl`, `uuid`

## 🚀 Installation et Lancement

1. **Cloner le projet**
```bash
git clone <repository-url>
cd timesheet_employee_app
```

2. **Installer les dépendances**
```bash
flutter pub get
```

3. **Lancer l'application**
```bash
flutter run
```

## 📋 Structure du Projet

```
lib/
├── core/
│   ├── api/
│   │   └── api_service.dart          # Service API
│   ├── models/
│   │   ├── user.dart                 # Modèle utilisateur
│   │   ├── timesheet.dart            # Modèle pointage
│   │   └── site.dart                 # Modèle site
│   └── utils/                        # Utilitaires
├── features/
│   ├── auth/
│   │   └── login_screen.dart         # Écran de connexion
│   ├── dashboard/
│   │   └── dashboard_screen.dart     # Dashboard principal
│   ├── qr_scanner/
│   │   └── qr_scanner_screen.dart    # Scanner QR
│   └── profile/
│       └── profile_screen.dart       # Profil utilisateur
└── main.dart                         # Point d'entrée
```

## 🔍 Tests de Compatibilité

L'application a été testée avec le backend et tous les endpoints fonctionnent :

- ✅ **POST /api/Auth/login** - Connexion
- ✅ **GET /api/Employee** - Liste employés (163 employés)
- ✅ **GET /api/Site** - Liste sites (23 sites)
- ✅ **GET /api/TimesheetType** - Types de pointage (4 types)
- ✅ **POST /api/Timesheet** - Création pointage

## 📱 Captures d'écran

### Écran de Connexion
- Interface moderne avec gradient
- Champs email et mot de passe
- Identifiants de test pré-remplis

### Dashboard
- Informations utilisateur
- Actions principales
- Pointages récents

### Scanner QR
- Interface de scanner avec overlay
- Contrôles caméra (flash, flip)
- Traitement en temps réel

## 🛠️ Développement

### Ajouter de nouvelles fonctionnalités

1. **Créer un nouveau modèle** dans `lib/core/models/`
2. **Ajouter les méthodes API** dans `lib/core/api/api_service.dart`
3. **Créer l'écran** dans `lib/features/`
4. **Ajouter la navigation** dans le dashboard

### Tests

```bash
flutter test
```

## 📄 Licence

Ce projet est développé pour le système de pointage TimeSheet.

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le repository
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Créer une Pull Request

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.
