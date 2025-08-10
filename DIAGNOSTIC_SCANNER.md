# 🔍 **DIAGNOSTIC ET RÉSOLUTION DES ERREURS DE SCAN**

## 📋 **PROBLÈME IDENTIFIÉ**

L'erreur de scan persiste malgré les corrections appliquées. Ce document explique comment diagnostiquer et résoudre le problème.

## 🎯 **CAUSES POSSIBLES**

### 1. **Problème d'Authentification**
- Token expiré ou invalide
- Session utilisateur corrompue
- Redirection vers la page de connexion

### 2. **Problème de Données**
- Structure des données invalide
- Champs manquants ou incorrects
- Validation côté serveur échouée

### 3. **Problème de Connexion API**
- Endpoint inaccessible
- Erreur serveur (500)
- Timeout de connexion

## 🛠️ **OUTILS DE DIAGNOSTIC AJOUTÉS**

### **Bouton "🧪 Test API"**
- Teste la création d'un timesheet avec des données mockées
- Vérifie la connectivité à l'API
- Affiche les erreurs détaillées

### **Bouton "📊 Status API"**
- Vérifie le statut de l'API
- Teste l'authentification
- Affiche les informations de connexion

### **Logs Détaillés dans la Console**
- Données envoyées à l'API
- Réponses reçues
- Erreurs complètes

## 🔧 **ÉTAPES DE DIAGNOSTIC**

### **Étape 1 : Vérifier l'Authentification**
1. Ouvrir la console du navigateur (F12)
2. Vérifier que le token est présent dans localStorage
3. Utiliser le bouton "📊 Status API"

### **Étape 2 : Tester la Connexion API**
1. Cliquer sur "🧪 Test API"
2. Observer les messages dans la console
3. Vérifier les codes de statut HTTP

### **Étape 3 : Analyser les Erreurs**
1. Regarder les messages d'erreur affichés
2. Vérifier les logs dans la console
3. Identifier le type d'erreur (400, 401, 500, etc.)

## 📊 **CODES D'ERREUR ET SOLUTIONS**

### **HTTP 400 - Bad Request**
- **Cause** : Données invalides envoyées à l'API
- **Solution** : Vérifier la structure des données dans la console

### **HTTP 401 - Unauthorized**
- **Cause** : Token expiré ou invalide
- **Solution** : Se reconnecter via la page de connexion

### **HTTP 500 - Internal Server Error**
- **Cause** : Erreur côté serveur
- **Solution** : Réessayer plus tard ou contacter l'administrateur

## 🧪 **TEST AVEC DONNÉES MOCKÉES**

Le bouton "🧪 Test API" utilise des données de test :
```javascript
const mockData = {
    code: 'TS1234567890',
    details: JSON.stringify({
        uid: currentUser.id,
        pid: planningId,
        ts: Date.now(),
        type: timesheetTypeId
    }),
    start: new Date().toISOString(),
    planningId: planningId,
    timesheetTypeId: timesheetTypeId
};
```

## 📱 **UTILISATION DU SCANNER**

### **Avant le Scan**
1. S'assurer d'être connecté
2. Vérifier que l'API est accessible
3. Tester avec le bouton "🧪 Test API"

### **Pendant le Scan**
1. Observer les messages dans la console
2. Vérifier les données envoyées
3. Analyser les réponses de l'API

### **Après le Scan**
1. Vérifier le message de succès/erreur
2. Consulter les logs dans la console
3. Utiliser les boutons de diagnostic si nécessaire

## 🔍 **VÉRIFICATIONS AUTOMATIQUES**

Le scanner vérifie automatiquement :
- ✅ Authentification de l'utilisateur
- ✅ Connexion à l'API
- ✅ Validité des données
- ✅ Statut des réponses

## 📞 **SUPPORT ET DÉPANNAGE**

### **Si l'erreur persiste :**
1. Utiliser les boutons de diagnostic
2. Consulter la console du navigateur
3. Vérifier les logs d'erreur
4. Tester avec des données mockées

### **Informations à fournir :**
- Message d'erreur affiché
- Logs de la console
- Code de statut HTTP
- Données envoyées à l'API

## 🎯 **OBJECTIF FINAL**

Avec ces outils de diagnostic, nous devons pouvoir :
- ✅ Identifier précisément la cause de l'erreur
- ✅ Tester l'API avec des données valides
- ✅ Vérifier la connectivité et l'authentification
- ✅ Résoudre définitivement le problème de scan

---

**Dernière mise à jour :** $(Get-Date -Format "dd/MM/yyyy HH:mm")
**Version :** 1.0
**Statut :** En cours de diagnostic
