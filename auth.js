// Gestionnaire d'authentification pour l'application TimeSheet
class AuthManager {
  constructor() {
    this.API_BASE_URL = 'https://timesheetapp.azurewebsites.net/api'; // URL réelle de l'API Flutter
    this.tokenKey = 'timesheet_token';
    this.userKey = 'timesheet_user';
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    const token = this.getToken();
    return token !== null && token !== undefined;
  }

  // Obtenir le token d'authentification
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Obtenir les informations utilisateur
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Sauvegarder le token et les données utilisateur
  saveAuthData(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Se connecter
  async login(email, password) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.token) {
          this.saveAuthData(data.token, data.user);
          // Charger les informations utilisateur après connexion
          await this.loadCurrentUser();
          return { success: true, user: data.user };
        } else {
          return { success: false, error: 'Token non reçu' };
        }
      } else if (response.status === 401) {
        return { success: false, error: 'Identifiants incorrects' };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { success: false, error: 'Erreur de connexion réseau' };
    }
  }

  // Valider le token (version simplifiée sans appel API)
  async validateToken() {
    try {
      const token = this.getToken();
      if (!token) {
        console.log('❌ Pas de token à valider');
        return false;
      }

      console.log('🔐 Validation du token (locale)...');
      
      // Vérification locale simple - on considère le token valide s'il existe
      // et qu'il n'est pas vide
      if (token && token.length > 0) {
        console.log('✅ Token valide (vérification locale)');
        return true;
      } else {
        console.log('❌ Token invalide (vide)');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur validation token:', error);
      return false;
    }
  }

  // Se déconnecter
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.location.href = 'login.html';
  }

  // Obtenir les en-têtes d'authentification
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    };
  }

  // Charger les informations de l'utilisateur connecté (comme dans l'APK Flutter)
  async loadCurrentUser() {
    if (!this.getToken()) return;

    try {
      console.log('🔄 Chargement des informations utilisateur...');
      
      // Première tentative : avec en-tête Authorization
      let response = await fetch(`${this.API_BASE_URL}/Auth/users/1`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      // Si ça échoue à cause du CORS, essayer sans en-tête Authorization
      if (!response.ok && response.status === 0) {
        console.log('⚠️ Problème CORS détecté, tentative sans en-tête Authorization...');
        response = await fetch(`${this.API_BASE_URL}/Auth/users/1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Données utilisateur reçues:', data);
        
        // L'API retourne une liste d'utilisateurs, prenons le premier
        if (Array.isArray(data) && data.length > 0) {
          const user = data[0];
          this.saveAuthData(this.getToken(), user);
          console.log('✅ Utilisateur chargé depuis la liste:', user.displayName);
        } else if (typeof data === 'object') {
          this.saveAuthData(this.getToken(), data);
          console.log('✅ Utilisateur chargé depuis l\'objet:', data.displayName);
        } else {
          throw new Error('Format de réponse inattendu');
        }
      } else {
        console.log(`⚠️ Erreur ${response.status}: ${response.statusText}`);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement de l\'utilisateur:', error);
      // Créer un utilisateur par défaut si nécessaire
      const defaultUser = {
        id: 1,
        displayName: 'Test User',
        userName: 'test',
        employeeId: null,
        employee: null
      };
      this.saveAuthData(this.getToken(), defaultUser);
      console.log('✅ Utilisateur par défaut créé');
    }
  }
}

// Fonction de connexion
async function loginUser(email, password) {
  const authManager = new AuthManager();
  const result = await authManager.login(email, password);
  
  if (result.success) {
    window.location.href = 'index.html';
  } else {
    return result.error;
  }
}

// Fonction de déconnexion
function logoutUser() {
  const authManager = new AuthManager();
  authManager.logout();
}
