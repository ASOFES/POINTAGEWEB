// Gestionnaire d'authentification pour l'application TimeSheet
class AuthManager {
  constructor() {
    this.API_BASE_URL = 'https://api.pointage.com/api'; // URL de votre API de production
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
          Email: email,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.token) {
          this.saveAuthData(data.token, data.user);
          return { success: true, user: data.user };
        } else {
          return { success: false, error: 'Token non reçu' };
        }
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { success: false, error: 'Erreur de connexion réseau' };
    }
  }

  // Valider le token
  async validateToken() {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(`${this.API_BASE_URL}/Auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur validation token:', error);
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
