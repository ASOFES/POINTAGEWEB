# 📱 Guide d'Installation APK TimeSheet

## ✅ APK Disponibles

Les APK suivants sont prêts à l'installation :

### 📱 Application Employé
- **app-arm64-v8a-release.apk** (11.7MB) - **RECOMMANDÉ** pour la plupart des téléphones
- **app-armeabi-v7a-release.apk** (10.9MB) - Anciens téléphones
- **app-x86_64-release.apk** (12.3MB) - Émulateurs

## 🔧 Solutions pour "Échec d'enregistrement"

### 1️⃣ **Activer l'installation depuis des sources inconnues**
```
Paramètres > Sécurité > Sources inconnues (ON)
```

### 2️⃣ **Désinstaller l'ancienne version**
```
Paramètres > Applications > TimeSheet > Désinstaller
```

### 3️⃣ **Redémarrer le téléphone**
```
Redémarrage complet pour nettoyer le cache
```

### 4️⃣ **Vérifier l'espace de stockage**
```
Paramètres > Stockage > Vérifier l'espace disponible
```

### 5️⃣ **Utiliser un gestionnaire de fichiers**
```
- Télécharger l'APK
- Ouvrir avec "Gestionnaire de fichiers"
- Cliquer sur l'APK pour installer
```

## 🎯 **APK Recommandé**

**Utilisez `app-arm64-v8a-release.apk`** - Compatible avec :
- ✅ Samsung Galaxy (S6 et plus récent)
- ✅ Huawei (P8 et plus récent)
- ✅ Xiaomi (Redmi Note 3 et plus récent)
- ✅ OnePlus (tous modèles)
- ✅ Google Pixel (tous modèles)

## 📋 **Instructions d'Installation**

1. **Téléchargez** `app-arm64-v8a-release.apk`
2. **Activez** "Sources inconnues" dans les paramètres
3. **Ouvrez** l'APK avec le gestionnaire de fichiers
4. **Autorisez** l'installation
5. **Lancez** l'application
6. **Connectez-vous** avec : `Test@test.com` / `test123`

## 🚨 **Si l'installation échoue toujours**

### Option A : APK Debug
```bash
flutter build apk --debug
```

### Option B : APK Web
```bash
flutter build web --release
```

### Option C : Test sur navigateur
```
http://localhost:9003
```

## 📞 **Support**

Si le problème persiste :
1. **Marque et modèle** de votre téléphone
2. **Version Android** installée
3. **Message d'erreur** exact
4. **Étapes** suivies

---

**Les APK existants contiennent toutes les corrections récentes !** ✅ 