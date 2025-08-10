// Variables globales pour le scanner
let html5QrCode = null;
let isScanning = false;
let isProcessing = false;
let scannerDisabled = false;
let lastScannedQR = null;
let lastScanTime = null;

// Sécurité anti-spam scan
const SCAN_COOLDOWN = 3000; // 3 secondes entre chaque scan

// Vérifier les permissions de la caméra (HTTPS ou localhost requis)
async function checkCameraPermissions() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
        // Fermer immédiatement le flux, on laisse html5-qrcode gérer ensuite
        stream.getTracks().forEach(t => t.stop());
        return true;
    } catch (err) {
        console.error('❌ Accès à la caméra refusé:', err);
        showScannerMessage('❌ Accès à la caméra refusé. Autorisez la caméra dans votre navigateur et utilisez HTTPS ou localhost.', 'error');
        updateCameraStatus(false);
        return false;
    }
}

// Initialisation du scanner
async function startScanner() {
    if (!isLoggedIn()) {
        showScannerMessage('⚠️ Veuillez vous connecter d\'abord', 'warning');
        return;
    }
    
    if (isScanning) {
        console.log('⚠️ Scanner déjà actif');
        return;
    }
    
    // Vérifier/obtenir l'autorisation caméra avant de démarrer
    const hasCam = await checkCameraPermissions();
    if (!hasCam) {
        return;
    }
    
    // Reset des flags de sécurité
    isProcessing = false;
    scannerDisabled = false;
    lastScannedQR = null;
    lastScanTime = null;
    
    console.log('📷 Démarrage du scanner QR...');
    showScannerMessage('📷 Démarrage du scanner...', 'info');
    
    // Mettre à jour l'interface
    document.getElementById('start-scan-btn').classList.add('hidden');
    document.getElementById('stop-scan-btn').classList.remove('hidden');
    updateCameraStatus(true);
    
    // Initialiser le scanner
    html5QrCode = new Html5Qrcode("qr-reader");
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2
    };
    
    html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
    ).then(() => {
        isScanning = true;
        showScannerMessage('✅ Scanner prêt - Pointez vers un QR code', 'success');
        console.log('✅ Scanner QR démarré avec succès');
    }).catch(err => {
        console.error('❌ Erreur démarrage scanner:', err);
        showScannerMessage(`❌ Erreur caméra: ${err}`, 'error');
        resetScannerButtons();
        updateCameraStatus(false);
    });
}

// Arrêter le scanner
function stopScanner() {
    if (!isScanning) {
        console.log('⚠️ Scanner déjà arrêté');
        return;
    }
    
    console.log('⏹️ Arrêt du scanner...');
    
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            console.log('✅ Scanner arrêté');
            resetScannerState();
        }).catch(err => {
            console.error('❌ Erreur arrêt scanner:', err);
            resetScannerState();
        });
    } else {
        resetScannerState();
    }
}

// Reset état du scanner
function resetScannerState() {
    isScanning = false;
    isProcessing = false;
    scannerDisabled = false;
    html5QrCode = null;
    resetScannerButtons();
    updateCameraStatus(false);
    showScannerMessage('⏹️ Scanner arrêté', 'info');
}

// Reset boutons scanner
function resetScannerButtons() {
    document.getElementById('start-scan-btn').classList.remove('hidden');
    document.getElementById('stop-scan-btn').classList.add('hidden');
}

// Mettre à jour le statut de la caméra
function updateCameraStatus(active) {
    const cameraStatus = document.getElementById('camera-status');
    if (active) {
        cameraStatus.className = 'status-dot status-active';
    } else {
        cameraStatus.className = 'status-dot status-inactive';
    }
}

// Callback succès scan
function onScanSuccess(decodedText, decodedResult) {
    // 🛡️ PROTECTION ABSOLUE ANTI-SPAM
    if (isProcessing || scannerDisabled) {
        console.log('🛡️ Scan bloqué - traitement en cours ou scanner désactivé');
        return;
    }
    
    // Vérifier le cooldown
    const now = Date.now();
    if (lastScanTime && (now - lastScanTime) < SCAN_COOLDOWN) {
        console.log(`🛡️ Scan bloqué - cooldown (${now - lastScanTime}ms < ${SCAN_COOLDOWN}ms)`);
        return;
    }
    
    // Vérifier si c'est le même QR
    if (lastScannedQR === decodedText) {
        console.log('🛡️ Scan bloqué - même QR code');
        showScannerMessage('⚠️ QR code déjà scanné récemment', 'warning');
        return;
    }
    
    // Activer les protections
    isProcessing = true;
    scannerDisabled = true;
    lastScannedQR = decodedText;
    lastScanTime = now;
    
    console.log('🎯 QR Code détecté:', decodedText);
    
    // Arrêter immédiatement le scanner
    stopScanner();
    
    // Traiter le QR code
    processQRCode(decodedText)
        .finally(() => {
            // Reset des protections après traitement
            setTimeout(() => {
                isProcessing = false;
                scannerDisabled = false;
            }, 1000);
        });
}

// Callback échec scan
function onScanFailure(error) {
    const msg = typeof error === 'string' ? error : (error && error.message) ? error.message : '';
    // Gestion claire des permissions
    if (msg.includes('NotAllowedError') || msg.includes('Permission') || msg.includes('NotReadableError')) {
        console.error('❌ Erreur d\'accès caméra:', msg);
        showScannerMessage('❌ Accès caméra refusé ou indisponible. Vérifiez les permissions navigateur.', 'error');
        updateCameraStatus(false);
        return;
    }
    // Ignorer le bruit normal de scan
    if (!msg || msg.includes('No QR code found')) {
        return;
    }
    console.log('🔍 Recherche QR en cours...', msg);
}

// Traitement principal du QR code
async function processQRCode(qrData) {
    try {
        console.log('🔍 TRAITEMENT QR:', qrData);
        showScannerMessage('🔍 Analyse du QR code...', 'info');
        
        // 📊 PARSING DU QR CODE (JSON d'abord, puis fallback "site|planning|type")
        let qrJson;
        let extractedData;
        try {
            qrJson = JSON.parse(qrData);
            console.log('✅ QR JSON parsé:', qrJson);
            showScannerMessage('✅ Format QR (JSON) valide', 'success');
            // 🔍 EXTRACTION INTELLIGENTE DES DONNÉES (comme Flutter)
            extractedData = extractQRData(qrJson);
        } catch (e) {
            console.warn('ℹ️ JSON invalide, tentative de parsing alternatif (site|planning|type)');
            // Fallback: format pipe-delimited "siteId|planningId|timesheetTypeId"
            const parts = typeof qrData === 'string' ? qrData.split('|') : [];
            if (parts.length >= 3) {
                const siteId = parseInt(parts[0]);
                const planningId = parseInt(parts[1]);
                const timesheetTypeId = parseInt(parts[2]);
                if (!Number.isNaN(siteId) && !Number.isNaN(planningId) && !Number.isNaN(timesheetTypeId)) {
                    extractedData = {
                        siteId,
                        planningId,
                        timesheetTypeId,
                        siteName: 'Site inconnu',
                        employeeId: null,
                        serviceType: getServiceType(timesheetTypeId, {})
                    };
                    console.log('✅ Format pipe détecté et parsé:', extractedData);
                    showScannerMessage('✅ Format QR (texte) valide', 'success');
                }
            }
            if (!extractedData) {
                showScannerMessage('❌ QR code invalide', 'error');
                showErrorDialog('❌ QR Code Invalide', 'Le QR code n\'est ni un JSON valide ni au format "siteId|planningId|timesheetTypeId".');
                return;
            }
        }
        
        if (!extractedData) {
            return; // Erreur déjà gérée dans extractQRData
        }
        
        const { siteId, planningId, timesheetTypeId, siteName, employeeId, serviceType } = extractedData;
        
        // 🔒 VÉRIFICATION SÉCURITÉ UTILISATEUR
        if (employeeId !== null && employeeId !== undefined) {
            const currentUser = getCurrentUser();
            if (employeeId !== currentUser.id) {
                console.log(`❌ SÉCURITÉ: Utilisateur connecté (${currentUser.id}) ≠ QR employeeId (${employeeId})`);
                showScannerMessage('❌ QR code non autorisé', 'error');
                showErrorDialog(
                    '🚫 QR Code Non Autorisé', 
                    `Ce QR code a été généré pour un autre employé.\\n\\n👤 Utilisateur connecté: ${currentUser.displayName} (ID: ${currentUser.id})\\n🔒 QR code pour: ID ${employeeId}\\n\\nVous ne pouvez scanner que vos propres QR codes.`
                );
                return;
            } else {
                console.log(`✅ SÉCURITÉ: QR code autorisé pour l'utilisateur ${currentUser.id}`);
                showScannerMessage(`✅ QR autorisé pour ${currentUser.displayName}`, 'success');
            }
        } else {
            console.log('ℹ️ SÉCURITÉ: QR générique (pas d\'employeeId) - autorisé');
            showScannerMessage('ℹ️ QR générique autorisé', 'info');
        }
        
        // 🔄 VÉRIFICATION ANTI-DOUBLONS QUOTIDIENS
        const isDuplicate = await checkDailyDuplicate(qrData);
        if (isDuplicate) {
            return; // Erreur déjà gérée dans checkDailyDuplicate
        }
        
        console.log(`🎯 Données extraites: Site ${siteId}, Planning ${planningId}, Type ${timesheetTypeId}`);
        showScannerMessage(`📊 Données: ${siteName} - Planning ${planningId}`, 'info');
        
        // 🚀 CRÉATION DU POINTAGE
        showScannerMessage('🚀 Enregistrement du pointage...', 'info');
        
        const result = await createTimesheet(siteId, planningId, timesheetTypeId, qrData);
        
        if (result.success) {
            console.log('🎉 SUCCÈS: Pointage enregistré');
            showScannerMessage('🎉 Pointage enregistré avec succès !', 'success');
            
            const now = new Date();
            const timeString = now.toLocaleString('fr-FR');
            const currentUser = getCurrentUser();
            
            showSuccessDialog(
                '🎉 POINTAGE RÉUSSI !',
                `Votre pointage a été enregistré avec succès !\\n\\n🔧 Type: ${serviceType}\\n📍 Site: ${siteName}\\n📋 Planning: ${planningId}\\n👤 Utilisateur: ${currentUser.displayName}\\n📧 Email: ${currentUser.email}\\n⏰ Date/Heure: ${timeString}`
            );
            
        } else {
            console.error('❌ ÉCHEC: Erreur création pointage:', result.error);
            showScannerMessage(`❌ Erreur: ${result.error}`, 'error');
            showErrorDialog('❌ Erreur d\'Enregistrement', `Impossible d'enregistrer le pointage:\\n\\n${result.error}`);
        }
        
    } catch (error) {
        console.error('❌ ERREUR TRAITEMENT QR:', error);
        showScannerMessage(`❌ Erreur traitement: ${error.message}`, 'error');
        showErrorDialog('❌ Erreur Inattendue', `Une erreur est survenue:\\n\\n${error.message}`);
    }
}

// Extraction intelligente des données QR (comme Flutter)
function extractQRData(qrJson) {
    let siteId, planningId, timesheetTypeId, siteName, employeeId;
    
    console.log('🔍 Clés disponibles:', Object.keys(qrJson));
    
    // Format Vercel exact (userId + userName + planningId + timeSheetId)
    if (qrJson.userId && qrJson.userName && qrJson.planningId) {
        siteId = 1;
        planningId = qrJson.planningId;
        timesheetTypeId = qrJson.timeSheetTypeId || 1;
        siteName = 'test';
        employeeId = qrJson.userId;
        console.log('Format détecté: Vercel (exact)');
    }
    // Format Vercel complet
    else if (qrJson.siteId && qrJson.planningId && qrJson.timesheetTypeId) {
        siteId = qrJson.siteId;
        planningId = qrJson.planningId;
        timesheetTypeId = qrJson.timesheetTypeId;
        siteName = qrJson.siteName || 'Site inconnu';
        employeeId = qrJson.employeeId;
        console.log('Format détecté: Vercel (complet)');
    }
    // Format Vercel sans employeeId
    else if (qrJson.siteId && qrJson.planningId) {
        siteId = qrJson.siteId;
        planningId = qrJson.planningId;
        timesheetTypeId = qrJson.timesheetTypeId || 1;
        siteName = qrJson.siteName || 'Site inconnu';
        console.log('Format détecté: Vercel (sans employeeId)');
    }
    // Format raccourci
    else if (qrJson.uid && qrJson.pid) {
        siteId = 1;
        planningId = qrJson.pid;
        timesheetTypeId = 1;
        siteName = 'Site par défaut';
        employeeId = qrJson.uid;
        console.log('Format détecté: raccourci');
    }
    // Extraction intelligente
    else {
        console.log('❌ Format non reconnu, extraction intelligente...');
        
        siteId = 1;
        planningId = 5; // Valeur par défaut
        timesheetTypeId = 1;
        siteName = 'Site par défaut';
        
        // Extraction intelligente du planningId
        if (qrJson.planningId) {
            planningId = qrJson.planningId;
        } else if (qrJson.pid) {
            planningId = qrJson.pid;
        } else if (qrJson.planning_id) {
            planningId = qrJson.planning_id;
        } else if (qrJson.id) {
            planningId = qrJson.id;
        } else {
            // Chercher tout nombre valide
            for (const [key, value] of Object.entries(qrJson)) {
                if (typeof value === 'number' && value > 0 && value < 1000) {
                    planningId = value;
                    console.log(`✅ Nombre trouvé (${key}): ${planningId}`);
                    break;
                }
            }
            
            if (planningId === 5) {
                planningId = Date.now() % 1000; // ID basé sur timestamp
                console.log(`⚠️ Aucun ID trouvé, génération automatique: ${planningId}`);
            }
        }
        
        // Extraction du timesheetTypeId
        if (qrJson.timeSheetTypeId) {
            timesheetTypeId = qrJson.timeSheetTypeId;
        } else if (qrJson.timesheetTypeId) {
            timesheetTypeId = qrJson.timesheetTypeId;
        } else if (qrJson.type) {
            timesheetTypeId = qrJson.type;
        }
        
        // Extraction de l'employeeId
        if (qrJson.userId) {
            employeeId = qrJson.userId;
        } else if (qrJson.employeeId) {
            employeeId = qrJson.employeeId;
        } else if (qrJson.uid) {
            employeeId = qrJson.uid;
        }
        
        console.log(`🔧 Extraction intelligente: Planning=${planningId}, Type=${timesheetTypeId}, Employee=${employeeId}`);
    }
    
    // Déterminer le type de service
    const serviceType = getServiceType(timesheetTypeId, qrJson);
    
    return {
        siteId,
        planningId,
        timesheetTypeId,
        siteName,
        employeeId,
        serviceType
    };
}

// Déterminer le type de service
function getServiceType(timesheetTypeId, qrJson) {
    // D'abord vérifier les champs explicites
    if (qrJson.serviceType) return qrJson.serviceType;
    if (qrJson.action) return qrJson.action;
    if (qrJson.type && typeof qrJson.type === 'string') return qrJson.type;
    
    // Sinon, selon le timesheetTypeId
    switch (timesheetTypeId) {
        case 1: return 'Début de Service';
        case 2: return 'Fin de Service';
        case 3: return 'Pause Début';
        case 4: return 'Pause Fin';
        case 5: return 'Pause Déjeuner';
        default: return 'Service Standard';
    }
}

// Vérification des doublons quotidiens
async function checkDailyDuplicate(qrData) {
    try {
        const currentUser = getCurrentUser();
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        // Stocker localement les QR scannés aujourd'hui
        const storageKey = `scannedQRs_${currentUser.id}_${today}`;
        const scannedToday = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        // Vérifier si ce QR a déjà été scanné aujourd'hui
        if (scannedToday.includes(qrData)) {
            console.log('❌ QR code déjà scanné aujourd\'hui');
            showScannerMessage('❌ QR déjà utilisé aujourd\'hui', 'error');
            showErrorDialog(
                '🚫 QR Code Déjà Utilisé',
                'Ce QR code a déjà été scanné aujourd\'hui par votre compte.\\n\\nUn même QR code ne peut être utilisé qu\'une seule fois par jour et par utilisateur.'
            );
            return true; // C'est un doublon
        }
        
        // Ajouter ce QR à la liste des scannés aujourd'hui
        scannedToday.push(qrData);
        localStorage.setItem(storageKey, JSON.stringify(scannedToday));
        
        return false; // Pas de doublon
        
    } catch (error) {
        console.error('❌ Erreur vérification doublons:', error);
        return false; // En cas d'erreur, autoriser
    }
}

// Création du timesheet
async function createTimesheet(siteId, planningId, timesheetTypeId, qrData) {
    try {
        const currentUser = getCurrentUser();
        const authToken = getAuthToken();
        
        // Générer un code unique (comme dans Flutter)
        const uniqueCode = generateUniqueCode();
        
        // Préparer les deux formats de payload possibles (APK vs legacy)
        const apkPayload = {
            site_id: siteId,
            planning_id: planningId,
            timesheet_type_id: timesheetTypeId,
            unique_code: uniqueCode,
            details: JSON.stringify({
                qrData: qrData,
                uid: currentUser?.id,
                un: currentUser?.displayName,
                pid: planningId,
                ts: Date.now(),
                ua: navigator.userAgent,
                device: 'Web',
                method: 'qr_scan'
            })
        };

        // Legacy API: exige un champ Code et une chaine details (<=256)
        const legacyDetails = (() => {
            const base = `QR web scan; uid=${currentUser?.id}; pid=${planningId}; ts=${Date.now()}; ua=${navigator.userAgent}`;
            return base.length > 250 ? base.slice(0, 250) : base;
        })();

        const legacyPayload = {
            EmployeeId: currentUser?.id,
            SiteId: siteId,
            PlanningId: planningId,
            TimesheetTypeId: timesheetTypeId,
            Start: new Date().toISOString(),
            Code: uniqueCode,
            Details: legacyDetails
        };
        
        console.log('📤 Préparation envoi timesheet (formats APK + Legacy)');
        
        const headers = {
            'Content-Type': 'application/json'
        };
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        // Tentatives séquentielles: d'abord /timesheets + apkPayload, puis /Timesheet + legacyPayload si 404
        const attempts = [
            // APK/new endpoints en JSON (même logique que l'APK mobile)
            { url: `${API_BASE_URL}/timesheets`, payload: apkPayload, label: 'APK JSON /timesheets', contentType: 'json' },
            { url: `${API_BASE_URL}/timesheet`, payload: apkPayload, label: 'APK JSON /timesheet', contentType: 'json' },
            // Legacy: diverses variantes de Content-Type pour éviter 415
            { url: `${API_BASE_URL}/Timesheet`, payload: legacyPayload, label: 'Legacy JSON /Timesheet', contentType: 'json' },
            { url: `${API_BASE_URL}/Timesheet`, payload: legacyPayload, label: 'Legacy JSON-Charset /Timesheet', contentType: 'json-charset' },
            { url: `${API_BASE_URL}/Timesheet`, payload: legacyPayload, label: 'Legacy TEXTJSON /Timesheet', contentType: 'textjson' },
            { url: `${API_BASE_URL}/Timesheet`, payload: legacyPayload, label: 'Legacy FORM /Timesheet', contentType: 'form' },
            // Variante pluriel legacy
            { url: `${API_BASE_URL}/Timesheets`, payload: legacyPayload, label: 'Legacy JSON /Timesheets', contentType: 'json' },
            { url: `${API_BASE_URL}/Timesheets`, payload: legacyPayload, label: 'Legacy FORM /Timesheets', contentType: 'form' }
        ];

        for (let i = 0; i < attempts.length; i++) {
            const { url, payload, label, contentType } = attempts[i];

            // Préparer en-têtes et corps selon contentType
            const perAttemptHeaders = { ...headers, 'Accept': 'application/json, text/plain, */*' };
            let body;
            if (contentType === 'form') {
                perAttemptHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
                const usp = new URLSearchParams();
                Object.entries(payload).forEach(([k, v]) => {
                    if (v !== undefined && v !== null) usp.append(k, String(v));
                });
                body = usp.toString();
            } else if (contentType === 'json-charset') {
                perAttemptHeaders['Content-Type'] = 'application/json; charset=utf-8';
                body = JSON.stringify(payload);
            } else if (contentType === 'textjson') {
                perAttemptHeaders['Content-Type'] = 'text/json';
                body = JSON.stringify(payload);
            } else {
                perAttemptHeaders['Content-Type'] = 'application/json';
                body = JSON.stringify(payload);
            }

            // Log sécurisé du body selon contentType (évite la référence à isLegacy)
            const bodyPreview = contentType === 'form' ? body : payload;
            console.log(`📤 Tentative #${i + 1} (${label}) vers ${url} | headers:`, perAttemptHeaders, '| body:', bodyPreview);
            const resp = await fetch(url, {
                method: 'POST',
                headers: perAttemptHeaders,
                body
            });
            console.log(`📡 Statut réponse (${label}):`, resp.status);

            if (resp.ok) {
                const result = await resp.json();
                console.log('✅ Résultat timesheet:', result);
                return { success: true, data: result };
            }

            if (resp.status === 401) {
                throw new Error('Non autorisé (401). Veuillez vous reconnecter pour rafraîchir votre session.');
            }

            if ((resp.status === 404 || resp.status === 415) && i < attempts.length - 1) {
                // On tente le fallback
                console.warn(`⚠️ Fallback (status ${resp.status}) depuis ${label} -> tentative suivante...`);
                continue;
            }

            const errText = await resp.text();
            throw new Error(`Erreur HTTP ${resp.status}: ${errText}`);
        }
        
    } catch (error) {
        console.error('❌ Erreur création timesheet:', error);
        return { success: false, error: error.message };
    }
}

// Générer un code unique
function generateUniqueCode() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${timestamp}_${random}`;
}

// Afficher un message dans le scanner
function showScannerMessage(message, type) {
    const container = document.getElementById('scanner-message');
    if (!container) return;
    
    container.innerHTML = `<div class="message message-${type}">${message}</div>`;
    
    // Auto-hide après 3 secondes sauf pour les erreurs
    if (type !== 'error') {
        setTimeout(() => {
            container.innerHTML = '';
        }, 3000);
    }
}

// Afficher modal de succès
function showSuccessDialog(title, message) {
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    document.getElementById('success-modal').style.display = 'block';
}

// Afficher modal d'erreur
function showErrorDialog(title, message) {
    document.getElementById('error-title').textContent = title;
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').style.display = 'block';
}

// Fermer modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Charger l'historique
async function loadHistory() {
    if (!isLoggedIn()) {
        showMessage('history-list', '⚠️ Veuillez vous connecter', 'warning');
        return;
    }
    
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<div class="message message-info">🔄 Chargement de l\'historique...</div>';
    
    try {
        // Simuler des données d'historique pour l'instant
        // Dans une vraie app, ceci viendrait de l'API
        const mockHistory = [
            {
                id: 1,
                type: 'Début de Service',
                site: 'Site Principal',
                date: new Date().toLocaleString('fr-FR'),
                status: 'Validé'
            },
            {
                id: 2,
                type: 'Fin de Service',
                site: 'Site Principal',
                date: new Date(Date.now() - 86400000).toLocaleString('fr-FR'),
                status: 'Validé'
            }
        ];
        
        if (mockHistory.length === 0) {
            historyList.innerHTML = '<div class="message message-info">📋 Aucun pointage trouvé</div>';
            return;
        }
        
        let historyHtml = '';
        mockHistory.forEach(item => {
            historyHtml += `
                <div class="history-item">
                    <h4>${item.type}</h4>
                    <p>📍 Site: ${item.site}</p>
                    <p>⏰ Date: ${item.date}</p>
                    <p>✅ Statut: ${item.status}</p>
                </div>
            `;
        });
        
        historyList.innerHTML = historyHtml;
        
    } catch (error) {
        console.error('❌ Erreur chargement historique:', error);
        historyList.innerHTML = `<div class="message message-error">❌ Erreur: ${error.message}</div>`;
    }
}

// Gestion des clics sur modals (fermer si clic à côté)
window.onclick = function(event) {
    const successModal = document.getElementById('success-modal');
    const errorModal = document.getElementById('error-modal');
    
    if (event.target === successModal) {
        successModal.style.display = 'none';
    }
    if (event.target === errorModal) {
        errorModal.style.display = 'none';
    }
}
