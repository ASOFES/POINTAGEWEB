import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Vibration,
  Dimensions,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { ApiService } from '../services/api';

const { width } = Dimensions.get('window');

export default function ScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastScannedData, setLastScannedData] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(0);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    const currentTime = Date.now();
    
    // Protection anti-doublon
    if (processing) {
      console.log('⏳ Traitement en cours, scan ignoré');
      return;
    }

    if (lastScannedData === data && (currentTime - lastScanTime) < 3000) {
      console.log('🔄 Même QR scanné récemment, scan ignoré');
      return;
    }

    // Marquer comme traité et vibrer
    setScanned(true);
    setProcessing(true);
    setLastScannedData(data);
    setLastScanTime(currentTime);
    Vibration.vibrate(100);

    console.log('QR Code scanné:', data);

    try {
      await processQRCode(data);
    } catch (error) {
      console.error('Erreur traitement QR:', error);
    } finally {
      setProcessing(false);
      // Permettre un nouveau scan après 2 secondes
      setTimeout(() => {
        setScanned(false);
        setLastScannedData(null);
      }, 2000);
    }
  };

  const processQRCode = async (qrData) => {
    try {
      console.log('🎯 Traitement QR code:', qrData);

      // Analyser le QR code (format attendu: siteId|planningId|timesheetTypeId)
      const parts = qrData.split('|');
      if (parts.length < 3) {
        throw new Error('Format QR code invalide. Format attendu: site|planning|type');
      }

      const [siteId, planningId, timesheetTypeId] = parts.map(p => parseInt(p));

      if (isNaN(siteId) || isNaN(planningId) || isNaN(timesheetTypeId)) {
        throw new Error('Les valeurs du QR code doivent être des nombres');
      }

      // Récupérer les données utilisateur
      const user = await ApiService.getUserData();
      if (!user) {
        throw new Error('Données utilisateur non disponibles');
      }

      // Créer le pointage
      const timesheetData = {
        site_id: siteId,
        planning_id: planningId,
        timesheet_type_id: timesheetTypeId,
        unique_code: `RN-${Date.now()}`,
        details: JSON.stringify({
          uid: user.id,
          un: user.displayName,
          pid: planningId,
          ts: Date.now(),
          lat: 0.0,
          lng: 0.0,
          device: 'ReactNative',
          method: 'qr_scan'
        })
      };

      console.log('📤 Envoi données pointage:', timesheetData);

      const response = await ApiService.createTimesheet(timesheetData);

      console.log('✅ Pointage créé avec succès:', response.id);

      Alert.alert(
        '✅ Pointage réussi !',
        `Pointage enregistré avec succès.\nID: ${response.id}`,
        [
          {
            text: 'Voir historique',
            onPress: () => navigation.navigate('History')
          },
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );

    } catch (error) {
      console.error('❌ Erreur pointage:', error);
      Alert.alert(
        '❌ Erreur de pointage',
        error.message || 'Une erreur est survenue lors du pointage',
        [
          {
            text: 'Réessayer',
            onPress: () => {
              setScanned(false);
              setLastScannedData(null);
            }
          },
          { text: 'OK' }
        ]
      );
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setProcessing(false);
    setLastScannedData(null);
    setLastScanTime(0);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Demande d'autorisation caméra...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Pas d'accès à la caméra</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner QR</Text>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={resetScanner}
        >
          <Text style={styles.resetButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Scanner */}
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
        />
        
        {/* Scanner Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        {processing ? (
          <>
            <Text style={styles.statusText}>⏳ Traitement en cours...</Text>
            <Text style={styles.statusSubtext}>Veuillez patienter</Text>
          </>
        ) : scanned ? (
          <>
            <Text style={styles.statusText}>✅ QR Code détecté !</Text>
            <Text style={styles.statusSubtext}>Traitement terminé</Text>
          </>
        ) : (
          <>
            <Text style={styles.statusText}>📱 Placez le QR code dans le cadre</Text>
            <Text style={styles.statusSubtext}>Alignez bien le code pour un scan optimal</Text>
          </>
        )}
      </View>

      {/* Manual Input Button */}
      <View style={styles.manualContainer}>
        <TouchableOpacity 
          style={styles.manualButton}
          onPress={() => navigation.navigate('ManualEntry')}
        >
          <Text style={styles.manualButtonText}>✏️ Saisie manuelle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#667eea',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resetButton: {
    padding: 5,
  },
  resetButtonText: {
    fontSize: 20,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#667eea',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  statusContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  manualContainer: {
    backgroundColor: '#667eea',
    padding: 20,
  },
  manualButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
