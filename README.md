# 🕐 Timesheet Web Sécurisé

Version web complète du système de pointage par QR Code avec sécurité renforcée, basée sur la configuration de l'APK mobile.

## 🛡️ Fonctionnalités de Sécurité

### 🔒 Authentification
- Connexion sécurisée via API Azure
- Gestion des tokens d'authentification
- Stockage sécurisé des données utilisateur
- Session persistante avec localStorage

### 🚫 Protection Anti-Scan Multiple
- **Cooldown de 3 secondes** entre chaque scan
- **Blocage des doublons** immédiats
- **Désactivation temporaire** du scanner pendant traitement
- **Reset automatique** des protections après traitement

### 👤 Sécurité Utilisateur Cross-QR
- **Vérification stricte** : L'utilisateur X ne peut pas scanner le QR de l'utilisateur Y
- **Validation d'employeeId** dans le QR code
- **Messages d'erreur explicites** pour les tentatives non autorisées
- **Support des QR génériques** (sans restriction d'utilisateur)

### 📅 Anti-Doublons Quotidiens
- **Un QR code = Un scan par jour par utilisateur**
- **Stockage local** des QR scannés quotidiennement
- **Validation avant envoi** au serveur

## 🎯 Formats QR Supportés

### Format Vercel Exact
```json
{
  "userId": 123,
  "userName": "John Doe",
  "planningId": 456,
  "timeSheetTypeId": 1
}
```

### Format Vercel Complet
```json
{
  "siteId": 1,
  "siteName": "Site Principal",
  "planningId": 456,
  "timesheetTypeId": 1,
  "employeeId": 123
}
```

### Format Raccourci
```json
{
  "uid": 123,
  "pid": 456
}
```

### 🧠 Extraction Intelligente
- Détection automatique de `planningId`, `pid`, `planning_id`, `id`
- Recherche de nombres valides dans le QR
- Génération automatique d'ID si aucun trouvé
- Support de multiples formats de `timesheetTypeId`

## 📱 Interface

### 🏠 Dashboard
- Informations utilisateur
- Statut de connexion
- Navigation intuitive

### 📷 Scanner QR
- **Statuts visuels** : Caméra (Rouge/Vert), GPS (Vert)
- **Messages en temps réel** pendant le scan
- **Dialogs de confirmation** pour succès/erreur
- **Boutons d'action** : Fermer ou Nouveau Scan

### 📋 Historique
- Liste des pointages effectués
- Détails complets de chaque entrée

## 🔧 Types de Service

| ID | Type de Service  |
| -- | ---------------- |
| 1  | Début de Service |
| 2  | Fin de Service   |
| 3  | Pause Début      |
| 4  | Pause Fin        |
| 5  | Pause Déjeuner   |

## 🚀 API

### Endpoints
- **Login** : `POST /Auth/login`
- **Timesheet** : `POST /Timesheet`

### Configuration
```javascript
const API_BASE_URL = 'https://timesheetapp.azurewebsites.net/api';
```

### Payload Timesheet
```json
{
  "employeeId": 123,
  "siteId": 1,
  "planningId": 456,
  "timesheetTypeId": 1,
  "start": "2025-01-09T15:30:00.000Z",
  "details": "{\"qrData\":\"...\",\"userAgent\":\"...\",\"timestamp\":1234567890,\"code\":\"unique_code\"}"
}
```

## 🛠️ Technologies

- **HTML5** : Structure et QR Scanner
- **CSS3** : Design moderne et responsive
- **JavaScript ES6+** : Logique applicative
- **html5-qrcode** : Librairie de scan QR
- **LocalStorage** : Stockage sécurisé local
- **Fetch API** : Communication avec le serveur

## 🔄 Compatibilité

- ✅ Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- ✅ Appareils mobiles (iOS, Android)
- ✅ Support caméra obligatoire pour le scan QR
- ✅ Fallback gracieux en cas d'erreur

## 🚦 Déploiement

1. **GitHub Pages** (recommandé pour sites statiques)
2. **Netlify** (avec configuration automatique)
3. **Vercel** (déploiement instantané)
4. **Serveur Web** classique (Apache, Nginx)

## 🔒 Sécurité Production

- ✅ HTTPS obligatoire pour accès caméra
- ✅ CSP (Content Security Policy) recommandé
- ✅ Validation côté serveur des données
- ✅ Rate limiting API
- ✅ Logs de sécurité

## 📁 Structure du Projet

```
timesheet-web-secure/
├── index.html          # Page principale avec navigation
├── app.js             # Logique principale et scanner QR
├── auth.js            # Authentification et gestion des sessions
├── config.js          # Configuration centralisée
├── dashboard.html     # Tableau de bord utilisateur
├── scanner.html       # Interface de scan QR
├── history.html       # Historique des pointages
├── profile.html       # Profil utilisateur
├── login.html         # Page de connexion
├── netlify.toml       # Configuration Netlify
└── README.md          # Documentation du projet
```

## 🚀 Installation et Utilisation

### 1. Cloner le Repository
```bash
git clone https://github.com/ASOFES/POINTAGEWEB.git
cd POINTAGEWEB
```

### 2. Ouvrir dans un Navigateur
```bash
# Ouvrir index.html dans un navigateur moderne
# Ou utiliser un serveur local
python -m http.server 8000
# Puis ouvrir http://localhost:8000
```

### 3. Configuration
- Modifier `config.js` pour ajuster les paramètres
- Vérifier l'URL de l'API dans `auth.js`
- Adapter les formats QR selon vos besoins

## 🔧 Configuration

### Scanner QR
```javascript
// Dans config.js
SCANNER: {
    COOLDOWN: 3000,           // Cooldown entre scans
    QR_BOX_SIZE: { width: 250, height: 250 },
    FPS: 10,                  // Images par seconde
    FACING_MODE: 'environment' // Caméra arrière
}
```

### API
```javascript
// Dans config.js
API: {
    BASE_URL: 'https://timesheetapp.azurewebsites.net/api',
    TIMEOUT: 30000            // Timeout en millisecondes
}
```

## 🧪 Tests

### Test de Connexion
1. Ouvrir l'application
2. Utiliser les identifiants de test :
   - Email: `totoasofes22@gmail.com`
   - Mot de passe: `admin123`

### Test Scanner
1. Se connecter
2. Aller dans la section Scanner
3. Pointer la caméra vers un QR code valide
4. Vérifier les protections de sécurité

## 🐛 Dépannage

### Caméra non accessible
- Vérifier que le site est en HTTPS
- Autoriser l'accès à la caméra dans le navigateur
- Vérifier qu'aucune autre application n'utilise la caméra

### Erreur API
- Vérifier la connectivité internet
- Vérifier l'URL de l'API dans `config.js`
- Vérifier les logs de la console

### Scanner bloqué
- Attendre le cooldown de 3 secondes
- Vérifier que le QR n'a pas déjà été scanné aujourd'hui
- Vérifier que l'utilisateur est autorisé pour ce QR

## 📝 Changelog

### Version 2.0.0 (09/01/2025)
- ✅ Configuration centralisée dans `config.js`
- ✅ Sécurité anti-spam renforcée
- ✅ Validation utilisateur cross-QR
- ✅ Anti-doublons quotidiens
- ✅ Interface responsive et moderne
- ✅ Support multi-formats QR
- ✅ Gestion d'erreurs complète

### Version 1.0.0
- ✅ Scanner QR basique
- ✅ Authentification simple
- ✅ Interface de base

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- **Email** : totoasofes22@gmail.com
- **GitHub Issues** : [Créer une issue](https://github.com/ASOFES/POINTAGEWEB/issues)
- **Documentation** : Voir ce README et les commentaires dans le code

---

**Version** : 2.0.0 Sécurisé  
**Dernière mise à jour** : 09/01/2025  
**Compatibilité** : Web, Mobile, Tablette  
**Mainteneur** : ASOFES Team
