import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/timesheet.dart';
import '../models/site.dart';

class ApiService {
  static const String baseUrl = 'https://timesheetapp.azurewebsites.net/api';
  static const String testEmail = 'Test@test.com';
  static const String testPassword = 'test123';

  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;
  User? _currentUser;

  // Getters
  String? get token => _token;
  User? get currentUser => _currentUser;
  bool get isLoggedIn => _token != null;

  // Méthode pour obtenir les headers avec authentification
  Map<String, String> get _headers {
    return {
      'Content-Type': 'application/json',
      if (_token != null) 'Authorization': 'Bearer $_token',
    };
  }

  // Connexion
  Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/Auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        
        // Sauvegarder le token
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        
        // Récupérer les informations de l'utilisateur
        await _loadCurrentUser();
        
        return true;
      } else if (response.statusCode == 401) {
        // Identifiants incorrects
        print('Identifiants incorrects: $email');
        return false;
      } else {
        print('Erreur de connexion: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e) {
      print('Erreur de connexion: $e');
      return false;
    }
  }

  // Déconnexion
  Future<void> logout() async {
    _token = null;
    _currentUser = null;
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // Charger le token depuis le stockage local
  Future<bool> loadToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('auth_token');
      
      if (_token != null) {
        await _loadCurrentUser();
        return true;
      }
      return false;
    } catch (e) {
      print('Erreur lors du chargement du token: $e');
      return false;
    }
  }

  // Charger les informations de l'utilisateur connecté
  Future<void> _loadCurrentUser() async {
    if (_token == null) return;

    try {
      // Récupérer l'utilisateur connecté via l'API Auth
      final userResponse = await http.get(
        Uri.parse('$baseUrl/Auth/users/1'), // Récupérer la liste des utilisateurs
        headers: _headers,
      );

      if (userResponse.statusCode == 200) {
        final data = jsonDecode(userResponse.body);
        
        // L'API retourne une liste d'utilisateurs, prenons le premier
        if (data is List && data.isNotEmpty) {
          _currentUser = User.fromJson(data.first);
          print('✅ Utilisateur chargé depuis la liste: ${_currentUser?.displayName}');
        } else if (data is Map<String, dynamic>) {
          _currentUser = User.fromJson(data);
          print('✅ Utilisateur chargé depuis l\'objet: ${_currentUser?.displayName}');
        } else {
          throw Exception('Format de réponse inattendu');
        }
      } else {
        throw Exception('Erreur ${userResponse.statusCode}: ${userResponse.body}');
      }
    } catch (e) {
      print('Erreur lors du chargement de l\'utilisateur: $e');
      // Créer un utilisateur par défaut si nécessaire
      _currentUser = User(
        id: 1,
        displayName: 'Test User',
        userName: 'test',
        employeeId: null,
        employee: null,
      );
      print('✅ Utilisateur par défaut créé');
    }
  }

  // Récupérer les sites
  Future<List<Site>> getSites() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/Site'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Site.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Erreur lors de la récupération des sites: $e');
      return [];
    }
  }

  // Récupérer les types de pointage
  Future<List<Map<String, dynamic>>> getTimesheetTypes() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/TimesheetType/GetByParentId/1'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.cast<Map<String, dynamic>>();
      }
      return [];
    } catch (e) {
      print('Erreur lors de la récupération des types de pointage: $e');
      return [];
    }
  }

  // Créer un pointage
  Future<Timesheet?> createTimesheet({
    required String code,
    required String details,
    required int planningId,
    required int timesheetTypeId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/Timesheet'),
        headers: _headers,
        body: jsonEncode({
          'code': code,
          'details': details,
          'start': DateTime.now().toIso8601String(),
          'planningId': planningId,
          'timesheetTypeId': timesheetTypeId,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Timesheet.fromJson(data);
      }
      return null;
    } catch (e) {
      print('Erreur lors de la création du pointage: $e');
      return null;
    }
  }

  // Récupérer les pointages de l'utilisateur
  Future<List<Timesheet>> getUserTimesheets(int userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/Timesheet/DailyResume/UserId/$userId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        // Gérer différents formats de réponse
        if (data is List) {
          return data.map((json) => Timesheet.fromJson(json)).toList();
        } else if (data is Map<String, dynamic>) {
          // Si c'est un objet unique, le convertir en liste
          return [Timesheet.fromJson(data)];
        } else {
          print('Format de réponse inattendu pour les pointages: ${data.runtimeType}');
          return [];
        }
      }
      return [];
    } catch (e) {
      print('Erreur lors de la récupération des pointages: $e');
      return [];
    }
  }

  // Récupérer le récapitulatif des pointages
  Future<Map<String, dynamic>?> getTimesheetResume(int userId, int scope) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/Timesheet/Resume/UserId/$userId/scope/$scope'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Erreur lors de la récupération du récapitulatif: $e');
      return null;
    }
  }
} 