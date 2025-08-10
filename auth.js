// Configuration API
const API_BASE_URL = 'https://timesheetapp.azurewebsites.net/api';

// Variables globales
let currentUser = null;
let authToken = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Application Timesheet chargée');
    checkExistingLogin();
});

// Vérifier si l'utilisateur est déjà connecté
function checkExistingLogin() {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
        try {
            currentUser = JSON.parse(savedUser);
            authToken = savedToken;
            console.log('✅ Utilisateur récupéré:', currentUser);
            showLoggedInState();
        } catch (e) {
            console.error('❌ Erreur parsing utilisateur sauvé:', e);
            clearStoredAuth();
        }
    }
}

// Connexion utilisateur
async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!email || !password) {
        showMessage('login-message', '⚠️ Veuillez remplir tous les champs', 'warning');
        return;
    }
    
    showMessage('login-message', '🔄 Connexion en cours...', 'info');
    
    try {
        console.log('🔐 Tentative de connexion:', email);
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        console.log('📡 Réponse serveur statut:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        // Essayer de récupérer un éventuel token dans les entêtes
        const authHeader = response.headers.get('Authorization') || response.headers.get('authorization');
        const bearerFromHeader = authHeader && authHeader.toLowerCase().startsWith('bearer ')
            ? authHeader.slice(7)
            : null;

        const userData = await response.json();
        console.log('✅ Données utilisateur reçues:', userData);
        
        // Adaptation pour la nouvelle structure API (utilisateur directement, pas nested)
        if (userData && (userData.id || userData.userId)) {
            currentUser = {
                id: userData.id || userData.userId,
                email: userData.email,
                displayName: userData.displayName || userData.userName || userData.name || email.split('@')[0],
                role: userData.role || 'Employé'
            };
            
            // Le token peut être dans le payload (différents noms) ou dans l'entête Authorization
            authToken = userData.token
                || userData.accessToken
                || userData.jwt
                || userData.authorizationToken
                || bearerFromHeader
                || null;
            
            // Sauvegarder dans localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            if (authToken) {
                localStorage.setItem('authToken', authToken);
            } else {
                // Nettoyer un éventuel ancien token invalide
                localStorage.removeItem('authToken');
            }
            
            console.log('🎉 Connexion réussie:', currentUser);
            showMessage('login-message', '✅ Connexion réussie !', 'success');
            
            setTimeout(() => {
                showLoggedInState();
            }, 1000);
            
        } else {
            throw new Error('Format de réponse utilisateur invalide');
        }
        
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        showMessage('login-message', `❌ Erreur de connexion: ${error.message}`, 'error');
    }
}

// Afficher l'état connecté
function showLoggedInState() {
    // Masquer la section login
    document.getElementById('login-section').classList.remove('active');
    
    // Activer le dashboard
    document.getElementById('dashboard-section').classList.add('active');
    
    // Mettre à jour la navigation
    document.querySelector('.nav-btn[onclick="showSection(\'login\')"]').style.display = 'none';
    document.querySelector('.nav-btn[onclick="showSection(\'dashboard\')"]').classList.add('active');
    
    // Afficher le bouton de déconnexion
    document.getElementById('logout-btn').classList.remove('hidden');
    
    // Mettre à jour les informations utilisateur
    document.getElementById('user-name').textContent = currentUser.displayName;
    document.getElementById('user-role').textContent = currentUser.role;
    document.getElementById('user-email').textContent = currentUser.email;
    
    console.log('✅ Interface mise à jour pour utilisateur connecté');
}

// Déconnexion
function logout() {
    console.log('🚪 Déconnexion utilisateur');
    
    // Vider les données
    currentUser = null;
    authToken = null;
    clearStoredAuth();
    
    // Réinitialiser l'interface
    showSection('login');
    document.querySelector('.nav-btn[onclick="showSection(\'login\')"]').style.display = 'block';
    document.getElementById('logout-btn').classList.add('hidden');
    
    // Vider les champs
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    
    // Message de confirmation
    showMessage('login-message', '✅ Déconnexion réussie', 'success');
}

// Vider le stockage local
function clearStoredAuth() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('lastScannedQRs'); // Vider aussi le cache QR
}

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
    return currentUser !== null && authToken !== null;
}

// Obtenir l'utilisateur actuel
function getCurrentUser() {
    return currentUser;
}

// Obtenir le token d'authentification
function getAuthToken() {
    return authToken;
}

// Afficher un message
function showMessage(containerId, message, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `<div class="message message-${type}">${message}</div>`;
    
    // Auto-hide après 5 secondes sauf pour les erreurs
    if (type !== 'error') {
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
}

// Navigation entre sections
function showSection(sectionName) {
    // Vérifier si l'utilisateur est connecté pour certaines sections
    if (!isLoggedIn() && ['dashboard', 'scanner', 'history'].includes(sectionName)) {
        showMessage('login-message', '⚠️ Veuillez vous connecter d\'abord', 'warning');
        return;
    }
    
    // Masquer toutes les sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Désactiver tous les boutons de navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Afficher la section demandée
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Activer le bouton correspondant
    const targetBtn = document.querySelector(`.nav-btn[onclick="showSection('${sectionName}')"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    console.log(`📱 Section active: ${sectionName}`);
}
