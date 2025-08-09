// Variables globales
let html5QrcodeScanner = null;
let isScanning = false;
let authManager = new AuthManager();
let currentSection = 'dashboard';
let timesheetHistory = [];
let isProcessing = false;
let lastScannedQR = '';
let lastScanTime = 0;
let scannerDisabled = false; // Protection supplémentaire: désactivation complète

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

// Vérifier l'authentification (version simplifiée)
async function checkAuthentication() {
  console.log('🔐 Vérification de l\'authentification...');
  
  if (!authManager.isAuthenticated()) {
    console.log('❌ Utilisateur non authentifié');
    showLoginMessage();
    return false;
  }

  console.log('✅ Token présent, authentification réussie');
  return true;
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
      // Header utilisateur
      document.getElementById('userDisplay').textContent = user.username || user.name || 'Utilisateur';
      document.getElementById('userName').textContent = user.username || user.name || 'Utilisateur';
      document.getElementById('userRole').textContent = user.role || 'Employé';
      document.getElementById('userEmail').textContent = user.email || 'email@example.com';
      
      // Avatar header
      const avatar = document.getElementById('userAvatar');
      const initials = (user.username || user.name || 'U').substring(0, 1).toUpperCase();
      avatar.textContent = initials;
      
      // Dashboard utilisateur (nouveaux éléments)
      const userNameDash = document.getElementById('userNameDash');
      const userRoleDash = document.getElementById('userRoleDash');
      const userEmailDash = document.getElementById('userEmailDash');
      const userAvatarDash = document.getElementById('userAvatarDash');
      
      if (userNameDash) userNameDash.textContent = user.username || user.name || 'Utilisateur';
      if (userRoleDash) userRoleDash.textContent = user.role || 'Employé';
      if (userEmailDash) userEmailDash.textContent = user.email || 'email@example.com';
      if (userAvatarDash) userAvatarDash.textContent = initials;
      
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
  
  // RÉINITIALISATION COMPLÈTE: Tous les verrous supprimés pour nouveau scan
  isProcessing = false;
  scannerDisabled = false;
  lastScannedQR = null;
  lastScanTime = 0;
  console.log('🔄 RÉINITIALISATION TOTALE: Prêt pour nouveau scan unique');

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
  
  // PROTECTION IMMÉDIATE: Si scanner désactivé = STOP TOTAL
  if (scannerDisabled) {
    console.log('🚫 SCANNER DÉSACTIVÉ: Scan bloqué complètement');
    return;
  }
  
  const currentTime = Date.now();
  
  // PROTECTION RENFORCÉE: Bloquer immédiatement si traitement en cours
  if (isProcessing) {
    console.log('⏳ BLOQUÉ: Traitement en cours, scan ignoré');
    return;
  }
  
  // PROTECTION ANTI-DOUBLON: Même QR dans les 500ms = ignoré (réduit de 1000ms)
  if (lastScannedQR === decodedText && (currentTime - lastScanTime) < 500) {
    console.log('🔄 BLOQUÉ: Même QR scanné récemment, scan ignoré');
    return;
  }
  
  // VERROUILLAGE TOTAL IMMÉDIAT
  isProcessing = true;
  scannerDisabled = true; // Désactiver complètement le scanner
  lastScannedQR = decodedText;
  lastScanTime = currentTime;
  
  console.log('🔒 VERROUILLAGE TOTAL: Scanner complètement désactivé');
  
  // Arrêter le scanner immédiatement après détection
  console.log('📷 Arrêt automatique du scanner après détection');
  stopScanner();
  
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
    console.log('QR Code reçu:', qrData);
    console.log('Longueur QR:', qrData.length, 'caractères');
    
    // Parser le JSON du QR code (comme dans l'APK Flutter)
    let qrJson;
    try {
      qrJson = JSON.parse(qrData);
      console.log('QR JSON parsé:', qrJson);
      console.log('Clés disponibles:', Object.keys(qrJson));
    } catch (e) {
      console.error('Erreur parsing JSON:', e);
      showErrorMessage('QR code invalide: Format JSON incorrect');
      return;
    }

    // Vérifier l'expiration du QR code (30 secondes) - comme dans l'APK
    if (qrJson.timestamp) {
      try {
        const qrTimestamp = new Date(qrJson.timestamp);
        const now = new Date();
        const difference = Math.floor((now - qrTimestamp) / 1000);
        
        if (difference > 30) {
          showErrorMessage('QR code expiré (plus de 30 secondes)');
          return;
        }
        
        console.log('QR code valide:', 30 - difference, 'secondes restantes');
      } catch (e) {
        console.error('Erreur parsing timestamp:', e);
      }
    }

    // Extraire les données selon le format (exactement comme l'APK Flutter)
    let siteId, planningId, timesheetTypeId;
    let siteName = '';
    let employeeId;
    
    // Format Vercel exact (userId + userName + planningId + timeSheetId)
    if (qrJson.userId && qrJson.userName && qrJson.planningId) {
      siteId = 1; // Site par défaut
      planningId = qrJson.planningId;
      timesheetTypeId = qrJson.timeSheetTypeId || 1;
      siteName = 'test'; // Site fixe pour correspondre au QR
      employeeId = qrJson.userId; // ID de l'utilisateur spécifique
      console.log('Format détecté: Vercel (exact)');
      console.log('  userId:', qrJson.userId);
      console.log('  userName:', qrJson.userName);
      console.log('  planningId:', qrJson.planningId);
      console.log('  timeSheetTypeId:', qrJson.timeSheetTypeId);
      console.log('  siteName:', siteName);
    }
    // Format Vercel (site + employé) - Format complet
    else if (qrJson.siteId && qrJson.planningId && qrJson.timesheetTypeId) {
      siteId = qrJson.siteId;
      planningId = qrJson.planningId;
      timesheetTypeId = qrJson.timesheetTypeId;
      siteName = qrJson.siteName || 'Site inconnu';
      employeeId = qrJson.employeeId; // ID de l'employé spécifique
      console.log('Format détecté: Vercel (complet)');
    }
    // Format Vercel (site + employé) - Format sans employeeId
    else if (qrJson.siteId && qrJson.planningId) {
      siteId = qrJson.siteId;
      planningId = qrJson.planningId;
      timesheetTypeId = qrJson.timesheetTypeId || 1;
      siteName = qrJson.siteName || 'Site inconnu';
      console.log('Format détecté: Vercel (sans employeeId)');
    }
    // Format raccourci (notre app)
    else if (qrJson.uid && qrJson.pid) {
      siteId = 1; // Site par défaut
      planningId = qrJson.pid;
      timesheetTypeId = 1; // Type par défaut
      siteName = 'Site par défaut';
      console.log('Format détecté: raccourci');
    }
    // Format inconnu - Essayons avec des valeurs par défaut
    else {
      console.log('❌ Format non reconnu, utilisation des valeurs par défaut');
      console.log('QR JSON reçu:', qrJson);
      console.log('Clés disponibles:', Object.keys(qrJson));
      siteId = 1;
      planningId = 5;
      timesheetTypeId = 1;
      siteName = 'Site par défaut';
    }

    // Vérifier que l'employé actuel correspond à celui du QR
    const currentUser = authManager.getUser();
    if (employeeId && currentUser && currentUser.id !== employeeId) {
      showErrorMessage('QR code invalide: Employé non autorisé');
      return;
    }

    console.log('Données extraites:');
    console.log('  SiteId:', siteId);
    console.log('  PlanningId:', planningId);
    console.log('  TimesheetTypeId:', timesheetTypeId);
    console.log('  SiteName:', siteName);
    console.log('  EmployeeId:', employeeId);

    // Créer automatiquement le timesheet après validation (comme l'APK)
    console.log('🔄 Création automatique du timesheet...');
    await createTimesheet(siteId, planningId, timesheetTypeId, qrData);
    
  } catch (error) {
    console.error('Erreur lors du traitement:', error);
    showErrorMessage('Erreur lors du traitement du QR code');
  } finally {
    hideScanIndicator();
    // Remettre TOUS les flags de traitement à false
    isProcessing = false;
    scannerDisabled = false; // Réactiver le scanner pour le prochain scan
    console.log('🔓 DÉVERROUILLAGE: Scanner réactivé pour nouveau scan');
  }
}

async function createTimesheet(siteId, planningId, timesheetTypeId, qrData) {
  try {
    const user = authManager.getUser();
    if (!user) {
      showErrorMessage('Utilisateur non connecté');
      return;
    }

    // VÉRIFICATION ANTI-DOUBLON: Vérifier si ce QR a déjà été utilisé aujourd'hui
    const alreadyUsedToday = await checkQRAlreadyUsedToday(qrData, user.id);
    if (alreadyUsedToday) {
      const siteName = qrData.split('|')[0] || 'Site inconnu';
      showErrorMessage(`⚠️ Vous avez déjà pointé sur ce site aujourd'hui !`);
      updateStatus(`❌ QR déjà utilisé aujourd'hui - Site: ${siteName}`, 'error');
      console.log('🚫 DOUBLON DÉTECTÉ: QR déjà utilisé aujourd\'hui par cet utilisateur');
      return;
    }

    const uniqueCode = generateUniqueCode();

    // Créer des détails raccourcis pour respecter la limite de 256 caractères (comme l'APK)
    const details = {
      uid: user.id, // ID de l'employé réel
      un: user.displayName,
      pid: planningId,
      ts: Date.now(),
      lat: 0.0, // Position par défaut pour le web
      lng: 0.0
    };

    const detailsJson = JSON.stringify(details);

    const payload = {
      code: uniqueCode,
      details: detailsJson,
      start: new Date().toISOString(),
      planningId: planningId,
      timesheetTypeId: timesheetTypeId
    };

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
      showSuccessMessage('✅ Pointage automatique enregistré avec succès!');
      console.log('✅ Timesheet créé avec ID:', result.id);
      
      // Mettre à jour le statut pour informer l'utilisateur
      updateStatus('✅ QR scanné avec succès ! Scanner arrêté automatiquement.', 'success');
      
      // Recharger l'historique
      await loadHistory();
    } else {
      const errorData = await response.json();
      showErrorMessage(`❌ Échec de l'enregistrement automatique: ${errorData.message || 'Erreur serveur'}`);
      updateStatus('❌ Erreur lors du pointage. Relancez le scanner si nécessaire.', 'error');
    }
  } catch (error) {
    console.error('Erreur création timesheet:', error);
    showErrorMessage(`Erreur: ${error.message}`);
  } finally {
    // S'assurer que TOUS les flags de traitement sont remis à false
    isProcessing = false;
    scannerDisabled = false; // Réactiver le scanner pour le prochain scan
    console.log('🔓 DÉVERROUILLAGE: Scanner réactivé pour nouveau scan');
  }
}

// Vérifier si un QR code a déjà été utilisé aujourd'hui par cet utilisateur
async function checkQRAlreadyUsedToday(qrData, userId) {
  try {
    console.log('🔍 Vérification anti-doublon pour QR:', qrData);
    
    // Récupérer l'historique des pointages de l'utilisateur pour aujourd'hui
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    const token = authManager.getToken();
    const response = await fetch(`https://timesheetapp.azurewebsites.net/api/timesheets/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('⚠️ Impossible de vérifier l\'historique - autorisation du scan');
      return false; // En cas d'erreur, on autorise le scan
    }

    const timesheets = await response.json();
    console.log('📋 Historique récupéré:', timesheets.length, 'pointages');

    // Vérifier si un pointage avec le même QR existe aujourd'hui
    const todayTimesheets = timesheets.filter(timesheet => {
      const timesheetDate = new Date(timesheet.created_at);
      return timesheetDate >= startOfDay && timesheetDate < endOfDay;
    });

    console.log('📅 Pointages aujourd\'hui:', todayTimesheets.length);

    // Chercher si le même QR a été utilisé (comparer par site_id et planning_id)
    const sameQRUsed = todayTimesheets.some(timesheet => {
      // Comparer les IDs spécifiques du QR plutôt que le contenu brut
      return timesheet.site_id === parseInt(qrData.split('|')[0]) && 
             timesheet.planning_id === parseInt(qrData.split('|')[1]);
    });

    if (sameQRUsed) {
      console.log('🚫 QR DÉJÀ UTILISÉ aujourd\'hui !');
    } else {
      console.log('✅ QR non utilisé aujourd\'hui - autorisation du scan');
    }

    return sameQRUsed;
    
  } catch (error) {
    console.error('❌ Erreur vérification anti-doublon:', error);
    // En cas d'erreur, on autorise le scan pour ne pas bloquer l'utilisateur
    return false;
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

// Afficher un message d'erreur
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ff4444;
    color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    z-index: 10000;
    text-align: center;
    max-width: 300px;
    font-size: 14px;
  `;
  errorDiv.innerHTML = `
    <div style="font-size: 24px; margin-bottom: 10px;">❌</div>
    ${message}
  `;
  
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 4000);
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
    const user = authManager.getUser();
    if (!user) {
      console.error('Aucun utilisateur connecté');
      return;
    }

    console.log('📊 Chargement des pointages pour utilisateur:', user.id);
    
    const response = await fetch(`${authManager.API_BASE_URL}/Timesheet/DailyResume/UserId/${user.id}`, {
      method: 'GET',
      headers: authManager.getAuthHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📋 Pointages récupérés:', data);
      
      // Gérer différents formats de réponse (comme dans l'APK Flutter)
      if (Array.isArray(data)) {
        timesheetHistory = data;
        console.log('✅ Format liste détecté:', data.length, 'pointages');
      } else if (typeof data === 'object') {
        timesheetHistory = [data];
        console.log('✅ Format objet détecté, converti en liste');
      } else {
        timesheetHistory = [];
        console.log('⚠️ Format inattendu, liste vide');
      }
      
      updateHistoryDisplay();
    } else {
      console.error('❌ Erreur chargement historique:', response.status, response.statusText);
      timesheetHistory = [];
      updateHistoryDisplay();
    }
  } catch (error) {
    console.error('❌ Erreur loadHistory:', error);
    timesheetHistory = [];
    updateHistoryDisplay();
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

// Générer un code unique (comme dans l'APK Flutter)
function generateUniqueCode() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `QR_${timestamp}_${random}`.toUpperCase();
}
