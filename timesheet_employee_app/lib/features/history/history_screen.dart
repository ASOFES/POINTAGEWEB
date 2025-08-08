import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/api/api_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final ApiService _apiService = ApiService();
  List<dynamic> _timesheets = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    print('🚀 HistoryScreen initState appelé');
    _loadTimesheets();
  }

  Future<void> _loadTimesheets() async {
    print('📊 Chargement des pointages...');
    setState(() {
      _isLoading = true;
    });

    try {
      final user = _apiService.currentUser;
      print('👤 Utilisateur: ${user?.displayName}');
      
      if (user != null) {
        final timesheets = await _apiService.getUserTimesheets(user.id);
        print('📋 Pointages récupérés: ${timesheets.length}');
        
        setState(() {
          _timesheets = timesheets;
          _isLoading = false;
        });
      } else {
        print('❌ Aucun utilisateur connecté');
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      print('❌ Erreur: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    print('🏗️ HistoryScreen build appelé - isLoading: $_isLoading, count: ${_timesheets.length}');
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Historique des Pointages'),
        backgroundColor: const Color(0xFF1976D2),
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Chargement des pointages...'),
                ],
              ),
            )
          : _timesheets.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.history,
                        size: 64,
                        color: Colors.grey,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'Aucun pointage trouvé',
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: _timesheets.length,
                  itemBuilder: (context, index) {
                    final timesheet = _timesheets[index];
                    final startDate = DateTime.parse(timesheet.start);
                    final isCompleted = timesheet.end != null;
                    
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: isCompleted ? Colors.green : const Color(0xFF1976D2),
                          child: Icon(
                            isCompleted ? Icons.logout : Icons.login,
                            color: Colors.white,
                          ),
                        ),
                        title: Text(
                          isCompleted ? 'Sortie' : 'Entrée',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          '${DateFormat('dd/MM/yyyy HH:mm').format(startDate)} - Code: ${timesheet.code}',
                        ),
                        trailing: Text(
                          DateFormat('HH:mm').format(startDate),
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
} 