// Configuration centralisée de l'application Timesheet
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'https://timesheetapp.azurewebsites.net/api',
        ENDPOINTS: {
            LOGIN: '/Auth/login',
            TIMESHEET: '/Timesheet'
        },
        TIMEOUT: 30000 // 30 secondes
    },

    // Sécurité Scanner
    SCANNER: {
        COOLDOWN: 3000, // 3 secondes entre chaque scan
        QR_BOX_SIZE: { width: 250, height: 250 },
        FPS: 10,
        ASPECT_RATIO: 1.0,
        FACING_MODE: 'environment'
    },

    // Types de Service
    SERVICE_TYPES: {
        1: 'Début de Service',
        2: 'Fin de Service', 
        3: 'Pause Début',
        4: 'Pause Fin',
        5: 'Pause Déjeuner'
    },

    // Formats QR Supportés
    QR_FORMATS: {
        VERCEL_EXACT: ['userId', 'userName', 'planningId', 'timeSheetTypeId'],
        VERCEL_COMPLETE: ['siteId', 'siteName', 'planningId', 'timesheetTypeId', 'employeeId'],
        SHORTCUT: ['uid', 'pid'],
        GENERIC: ['planningId', 'timesheetTypeId']
    },

    // Valeurs par défaut
    DEFAULTS: {
        SITE_ID: 1,
        SITE_NAME: 'Site Principal',
        TIMESHEET_TYPE_ID: 1
    },

    // Messages d'interface
    MESSAGES: {
        SCANNER: {
            STARTING: '📷 Démarrage du scanner...',
            READY: '✅ Scanner prêt - Pointez vers un QR code',
            STOPPED: '⏹️ Scanner arrêté',
            ERROR_CAMERA: '❌ Erreur caméra: ',
            QR_DETECTED: '🎯 QR Code détecté: ',
            PROCESSING: '🔍 Analyse du QR code...',
            SUCCESS_FORMAT: '✅ Format QR valide',
            ERROR_FORMAT: '❌ QR code invalide',
            UNAUTHORIZED: '❌ QR code non autorisé',
            DUPLICATE: '❌ QR déjà utilisé aujourd\'hui',
            RECORDING: '🚀 Enregistrement du pointage...',
            SUCCESS_RECORD: '🎉 Pointage enregistré avec succès !'
        },
        SECURITY: {
            USER_MISMATCH: '🚫 QR Code Non Autorisé',
            USER_MISMATCH_DESC: 'Ce QR code a été généré pour un autre employé.',
            DUPLICATE_DAILY: '🚫 QR Code Déjà Utilisé',
            DUPLICATE_DAILY_DESC: 'Ce QR code a déjà été scanné aujourd\'hui par votre compte.'
        }
    },

    // Configuration de stockage local
    STORAGE: {
        KEYS: {
            CURRENT_USER: 'currentUser',
            AUTH_TOKEN: 'authToken',
            SCANNED_QRS: 'scannedQRs'
        },
        EXPIRY: {
            AUTH_TOKEN: 24 * 60 * 60 * 1000, // 24 heures
            SCANNED_QRS: 24 * 60 * 60 * 1000  // 24 heures
        }
    },

    // Configuration de l'interface
    UI: {
        AUTO_HIDE_MESSAGES: {
            SUCCESS: 3000,  // 3 secondes
            INFO: 3000,     // 3 secondes
            WARNING: 5000,  // 5 secondes
            ERROR: 0        // Pas d'auto-hide
        },
        MODAL_ANIMATION_DURATION: 300
    }
};

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
