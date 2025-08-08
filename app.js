// Variables globales
let html5QrcodeScanner = null;
let isScanning = false;
let authManager = new AuthManager();
let currentSection = 'dashboard';
let timesheetHistory = [];

// Initialisation de la page
window.addEventListener('load', async function() {
  console.log('🚀 Initialisation de la page...');
  
  // Vérifier l'authentification
  if (!await checkAuthentication()) {
    return;
  }
  
  // Charger les données utilisateur
  await loadUserData();
  
  // Charger l'historique
  await loadHistory();
  
  updateStatus('✅ Application prête', 'success');
});

// Écouter l'événement de chargement de la bibliothèque QR
window.addEventListener('qrLibraryLoaded', function() {
  console.log('✅ Bibliothèque QR chargée');
  updateStatus('📷 Scanner QR prêt', 'success');
});

// Vérifier l'authentification
async function checkAuthentication() {
  if (!authManager.isAuthenticated()) {
    showLoginMessage();
    return false;
  }

  try {
    const isValid = await authManager.validateToken();
    if (!isValid) {
      authManager.logout();
      showLoginMessage();
      return false;
    }
    return true;
  } catch (error) {
    console.error('Erreur authentification:', error);
    authManager.logout();
    showLoginMessage();
    return false;
  }
}

// Afficher message de connexion
function showLoginMessage() {
  const container = document.querySelector('.container');
  container.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      text-align: center;
      z-index: 10000;
    ">
      <h3>🔐 Connexion Requise</h3>
      <p>Vous devez vous connecter pour utiliser l'application.</p>
      <button onclick="window.location.href='login.html'" class="btn btn-success" style="margin: 10px;">
        🚪 Aller à la Connexion
      </button>
    </div>
  `;
}

// Charger les données utilisateur
async function loadUserData() {
  try {
    const user = authManager.getUser();
    if (user) {
      document.getElementById('userDisplay').textContent = user.username || user.name || 'Utilisateur';
      document.getElementById('userName').textContent = user.username || user.name || 'Utilisateur';
      document.getElementById('userRole').textContent = user.role || 'Employé';
      document.getElementById('userEmail').textContent = user.email || 'email@example.com';
      
      // Avatar
      const avatar = document.getElementById('userAvatar');
      const initials = (user.username || user.name || 'U').substring(0, 1).toUpperCase();
      avatar.textContent = initials;
      
      // Profil
      document.getElementById('profileName').textContent = user.username || user.name || '-';
      document.getElementById('profileEmail').textContent = user.email || '-';
      document.getElementById('profileRole').textContent = user.role || 'Employé';
      document.getElementById('profileStatus').textContent = 'Connecté';
    }
  } catch (error) {
    console.error('Erreur chargement données utilisateur:', error);
  }
}

// Afficher une section
function showSection(sectionName) {
  // Masquer toutes les sections
  document.querySelectorAll('.dashboard-section, .scanner-section, .history-section, .profile-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Désactiver tous les onglets
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Afficher la section demandée
  const targetSection = document.getElementById(sectionName + '-section');
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // Activer l'onglet correspondant
  const targetTab = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  currentSection = sectionName;
  
  // Actions spécifiques selon la section
  if (sectionName === 'scanner') {
    checkHTTPS();
  } else if (sectionName === 'history') {
    loadHistory();
  } else if (sectionName === 'profile') {
    loadUserData();
  }
}

// Vérifier HTTPS
function checkHTTPS() {
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    updateStatus('❌ HTTPS requis pour accéder à la caméra. Utilisez https:// ou localhost.', 'error');
    return false;
  }
  return true;
}

// Démarrer le scanner
function startScanner() {
  if (!checkHTTPS()) return;
  
  if (typeof Html5Qrcode === 'undefined') {
    updateStatus('❌ Bibliothèque QR scanner non chargée', 'error');
    return;
  }

  const startButton = document.getElementById('startScanButton');
  const stopButton = document.getElementById('stopScanButton');
  
  if (startButton) startButton.style.display = 'none';
  if (stopButton) stopButton.style.display = 'block';
  
  updateStatus('🔄 Initialisation du scanner...', 'info');
  
  const html5QrCode = new Html5Qrcode("reader");
  
  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
  };
  
  const cameraConfig = {
    facingMode: "environment"
  };
  
  html5QrCode.start(
    cameraConfig,
    config,
    onScanSuccess,
    onScanFailure
  ).then(() => {
    updateStatus('📷 Scanner actif - Scannez un QR code', 'success');
    isScanning = true;
    window.html5QrCode = html5QrCode;
  }).catch(err => {
    updateStatus('❌ Erreur démarrage scanner: ' + err.message, 'error');
    if (startButton) startButton.style.display = 'block';
    if (stopButton) stopButton.style.display = 'none';
    isScanning = false;
  });
}

// Arrêter le scanner
function stopScanner() {
  if (window.html5QrCode) {
    window.html5QrCode.stop().then(() => {
      updateStatus('⏹️ Scanner arrêté', 'info');
      isScanning = false;
      
      const startButton = document.getElementById('startScanButton');
      const stopButton = document.getElementById('stopScanButton');
      if (startButton) startButton.style.display = 'block';
      if (stopButton) stopButton.style.display = 'none';
    }).catch(err => {
      console.error('Erreur arrêt scanner:', err);
    });
  }
}

// Succès de scan
function onScanSuccess(decodedText, decodedResult) {
  console.log('QR Code détecté:', decodedText);
  
  showScanIndicator('Validation du pointage...');
  
  // Traiter le QR code
  processQRCode(decodedText);
}

// Échec de scan
function onScanFailure(error) {
  // Ignorer les erreurs normales de détection
  const errorMessage = error.toString();
  if (!errorMessage.includes('No MultiFormat Readers were able to detect the code')) {
    console.log('Échec de scan:', errorMessage);
  }
}

// Traiter le QR code
async function processQRCode(qrData) {
  try {
    let payload;
    
    // Essayer de parser comme JSON
    try {
      const parsedData = JSON.parse(qrData);
      payload = {
        code: parsedData.code || `QR_${Date.now()}`,
        details: JSON.stringify(parsedData),
        start: new Date().toISOString(),
        planningId: parsedData.planningId || 5,
        timesheetTypeId: parsedData.timesheetTypeId || 1
      };
    } catch (e) {
      // Traiter comme texte simple
      payload = {
        code: qrData,
        details: `QR Code scanné - ${new Date().toLocaleString('fr-FR')}`,
        start: new Date().toISOString(),
        planningId: 5,
        timesheetTypeId: 1
      };
    }

    const response = await fetch(`${authManager.API_BASE_URL}/Timesheet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authManager.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      
      const successMessage = `✅ POINTAGE RÉUSSI ! ${new Date().toLocaleTimeString('fr-FR')}`;
      updateStatus(successMessage, 'success');
      showSuccessMessage(successMessage);
      
      // Arrêter le scanner
      stopScanner();
      
      // Actualiser l'historique
      await loadHistory();
      
    } else {
      const errorText = await response.text();
      updateStatus(`❌ Erreur: ${errorText}`, 'error');
    }
  } catch (error) {
    console.error('Erreur traitement QR:', error);
    updateStatus('❌ Erreur de connexion', 'error');
  } finally {
    hideScanIndicator();
  }
}

// Afficher l'indicateur de scan
function showScanIndicator(message) {
  const indicator = document.getElementById('scanIndicator');
  const messageEl = document.getElementById('scanMessage');
  messageEl.textContent = message;
  indicator.classList.add('show');
}

// Masquer l'indicateur de scan
function hideScanIndicator() {
  const indicator = document.getElementById('scanIndicator');
  indicator.classList.remove('show');
}

// Afficher un message de succès
function showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <div style="font-size: 24px; margin-bottom: 10px;">✅</div>
    ${message}
  `;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.parentNode.removeChild(successDiv);
    }
  }, 3000);
}

// Tester le scanner
function testScanner() {
  if (typeof Html5Qrcode === 'undefined') {
    updateStatus('❌ Bibliothèque QR non disponible', 'error');
    return;
  }
  
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      updateStatus('✅ Caméra accessible', 'success');
      stream.getTracks().forEach(track => track.stop());
    })
    .catch(err => {
      updateStatus(`❌ Erreur caméra: ${err.message}`, 'error');
    });
}

// Charger l'historique
async function loadHistory() {
  try {
    const response = await fetch(`${authManager.API_BASE_URL}/Timesheet`, {
      headers: {
        'Authorization': `Bearer ${authManager.getToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      timesheetHistory = data;
      updateHistoryDisplay();
    } else {
      updateStatus('❌ Erreur chargement historique', 'error');
    }
  } catch (error) {
    console.error('Erreur chargement historique:', error);
    updateStatus('❌ Erreur de connexion', 'error');
  }
}

// Mettre à jour l'affichage de l'historique
function updateHistoryDisplay() {
  const tbody = document.getElementById('historyTableBody');
  tbody.innerHTML = '';

  timesheetHistory.slice(0, 10).forEach(entry => {
    const date = new Date(entry.start || entry.createdAt).toLocaleString('fr-FR');
    const type = entry.timesheetTypeId === 1 ? '🟢 Entrée' : '🔴 Sortie';
    const status = '✅ Succès';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${date}</td>
      <td>${entry.code}</td>
      <td>${type}</td>
      <td>${status}</td>
    `;
    
    tbody.appendChild(row);
  });
}

// Actualiser les données
async function refreshData() {
  await loadUserData();
  await loadHistory();
  updateStatus('✅ Données actualisées', 'success');
}

// Actualiser le profil
async function refreshProfile() {
  await loadUserData();
  updateStatus('✅ Profil actualisé', 'success');
}

// Exporter l'historique
function exportHistory() {
  if (timesheetHistory.length === 0) {
    updateStatus('❌ Aucune donnée à exporter', 'error');
    return;
  }

  let csv = 'Date,Code,Type,Statut\n';
  
  timesheetHistory.forEach(entry => {
    const date = new Date(entry.start || entry.createdAt).toLocaleString('fr-FR');
    const type = entry.timesheetTypeId === 1 ? 'Entrée' : 'Sortie';
    const status = 'Succès';
    
    csv += `"${date}","${entry.code}","${type}","${status}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `historique_pointages_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  updateStatus('📥 Historique exporté', 'success');
}

// Déconnexion
function logout() {
  authManager.logout();
}

// Mettre à jour le statut
function updateStatus(message, type = 'info') {
  const statusDiv = document.getElementById('scanStatus');
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
  }
}
