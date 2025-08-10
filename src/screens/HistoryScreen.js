import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ApiService } from '../services/api';

export default function HistoryScreen({ navigation }) {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await ApiService.getUserData();
      setUser(userData);
      
      if (userData) {
        await loadTimesheets(userData.id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const loadTimesheets = async (userId) => {
    try {
      console.log('Loading timesheets for user:', userId);
      const data = await ApiService.getUserTimesheets(userId);
      console.log('Timesheets loaded:', data.length);
      
      // Trier par date décroissante
      const sortedData = data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setTimesheets(sortedData);
    } catch (error) {
      console.error('Error loading timesheets:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'historique');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await loadTimesheets(user.id);
    }
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimesheetDetails = (detailsString) => {
    try {
      if (detailsString) {
        const details = JSON.parse(detailsString);
        return details;
      }
    } catch (error) {
      console.error('Error parsing details:', error);
    }
    return null;
  };

  const renderTimesheetItem = ({ item }) => {
    const details = getTimesheetDetails(item.details);
    const isToday = new Date(item.created_at).toDateString() === new Date().toDateString();

    return (
      <TouchableOpacity style={[styles.itemContainer, isToday && styles.todayItem]}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>✅ Enregistré</Text>
          </View>
        </View>
        
        <View style={styles.itemContent}>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>🏷️ Code:</Text>
            <Text style={styles.itemValue}>{item.unique_code || 'N/A'}</Text>
          </View>
          
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>📍 Site:</Text>
            <Text style={styles.itemValue}>Site {item.site_id}</Text>
          </View>
          
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>📋 Planning:</Text>
            <Text style={styles.itemValue}>Planning {item.planning_id}</Text>
          </View>
          
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>⏰ Type:</Text>
            <Text style={styles.itemValue}>Type {item.timesheet_type_id}</Text>
          </View>

          {details && details.method && (
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>📱 Méthode:</Text>
              <Text style={styles.itemValue}>
                {details.method === 'qr_scan' ? 'Scan QR' : 
                 details.method === 'manual' ? 'Saisie manuelle' : 
                 details.method}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>Aucun pointage</Text>
      <Text style={styles.emptyText}>
        Vous n'avez pas encore effectué de pointage.
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Scanner')}
      >
        <Text style={styles.emptyButtonText}>📱 Faire un pointage</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Chargement de l'historique...</Text>
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
        <Text style={styles.headerTitle}>Historique</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{timesheets.length}</Text>
          <Text style={styles.statLabel}>Total pointages</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {timesheets.filter(t => 
              new Date(t.created_at).toDateString() === new Date().toDateString()
            ).length}
          </Text>
          <Text style={styles.statLabel}>Aujourd'hui</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {timesheets.filter(t => {
              const date = new Date(t.created_at);
              const now = new Date();
              const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
              return date >= weekStart;
            }).length}
          </Text>
          <Text style={styles.statLabel}>Cette semaine</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={timesheets}
        renderItem={renderTimesheetItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={timesheets.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  refreshButton: {
    padding: 5,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  itemContent: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  itemValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
