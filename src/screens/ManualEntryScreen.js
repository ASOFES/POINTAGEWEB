import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ApiService } from '../services/api';

export default function ManualEntryScreen({ navigation }) {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!qrCode.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un code QR');
      return;
    }

    setLoading(true);
    try {
      await processQRCode(qrCode.trim());
    } catch (error) {
      console.error('Error processing manual QR:', error);
    } finally {
      setLoading(false);
    }
  };

  const processQRCode = async (qrData) => {
    try {
      console.log('🎯 Traitement QR manuel:', qrData);

      // Analyser le QR code (format attendu: siteId|planningId|timesheetTypeId)
      const parts = qrData.split('|');
      if (parts.length < 3) {
        throw new Error('Format QR code invalide.\nFormat attendu: site|planning|type\nExemple: 1|2|3');
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
        unique_code: `RN-MANUAL-${Date.now()}`,
        details: JSON.stringify({
          uid: user.id,
          un: user.displayName,
          pid: planningId,
          ts: Date.now(),
          lat: 0.0,
          lng: 0.0,
          device: 'ReactNative',
          method: 'manual'
        })
      };

      console.log('📤 Envoi données pointage manuel:', timesheetData);

      const response = await ApiService.createTimesheet(timesheetData);

      console.log('✅ Pointage manuel créé avec succès:', response.id);

      Alert.alert(
        '✅ Pointage réussi !',
        `Pointage manuel enregistré avec succès.\nID: ${response.id}`,
        [
          {
            text: 'Voir historique',
            onPress: () => navigation.navigate('History')
          },
          {
            text: 'Nouveau pointage',
            onPress: () => setQrCode('')
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('❌ Erreur pointage manuel:', error);
      Alert.alert(
        '❌ Erreur de pointage',
        error.message || 'Une erreur est survenue lors du pointage manuel',
        [{ text: 'OK' }]
      );
    }
  };

  const fillExample = () => {
    setQrCode('1|2|3');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saisie manuelle</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>✏️ Instructions</Text>
          <Text style={styles.instructionsText}>
            Saisissez le code QR manuellement si le scanner ne fonctionne pas.
          </Text>
          <Text style={styles.instructionsText}>
            <Text style={styles.bold}>Format attendu:</Text> site|planning|type
          </Text>
          <Text style={styles.instructionsText}>
            <Text style={styles.bold}>Exemple:</Text> 1|2|3
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>🎯 Code QR</Text>
          <TextInput
            style={styles.input}
            value={qrCode}
            onChangeText={setQrCode}
            placeholder="Exemple: 1|2|3"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            multiline={false}
          />

          <TouchableOpacity 
            style={styles.exampleButton}
            onPress={fillExample}
            disabled={loading}
          >
            <Text style={styles.exampleButtonText}>📝 Utiliser l'exemple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading || !qrCode.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>✅ Valider le pointage</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Help */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>❓ Aide</Text>
          <Text style={styles.helpText}>
            • Le code QR est composé de 3 nombres séparés par des |
          </Text>
          <Text style={styles.helpText}>
            • Premier nombre : ID du site
          </Text>
          <Text style={styles.helpText}>
            • Deuxième nombre : ID du planning
          </Text>
          <Text style={styles.helpText}>
            • Troisième nombre : Type de pointage
          </Text>
          <Text style={styles.helpText}>
            • En cas de problème, contactez votre administrateur
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Scanner')}
          >
            <Text style={styles.actionButtonText}>📱 Retour au scanner</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.actionButtonText}>📊 Voir l'historique</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 15,
  },
  exampleButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  exampleButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});
