import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:uuid/uuid.dart';
import 'dart:convert';
import 'dart:math' as math;
import '../../core/api/api_service.dart';
import '../../core/models/timesheet.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  MobileScannerController? controller;
  bool _isScanning = true;
  bool _isProcessing = false;
  Position? _currentPosition;
  bool _gpsPermissionGranted = false;
  bool _cameraPermissionGranted = false;
  String _gpsStatus = 'Vérification...';
  final ApiService _apiService = ApiService();
  final TextEditingController _qrCodeController = TextEditingController();

  @override
  void initState() {
    super.initState();
    controller = MobileScannerController();
    _initializePermissions();
  }

  Future<void> _initializePermissions() async {
    print('🚀 Initialisation des permissions...');
    await _requestPermissions();
    
    // Vérifier immédiatement la position GPS si les permissions sont accordées
    final locationStatus = await Permission.location.status;
    if (locationStatus == PermissionStatus.granted) {
      print('📍 Permissions GPS accordées, vérification de la position...');
      await _getCurrentLocation();
    }
  }

  Future<void> _requestPermissions() async {
    try {
      print('🔐 Demande des permissions...');
      
      // Vérifier d'abord l'état actuel des permissions
      final locationStatus = await Permission.location.status;
      final cameraStatus = await Permission.camera.status;
      
      print('📱 État initial - GPS: $locationStatus, Caméra: $cameraStatus');
      
      // Demander les permissions GPS si nécessaire
      if (locationStatus != PermissionStatus.granted) {
        print('📍 Demande permission GPS...');
        setState(() {
          _gpsStatus = 'Demande permission GPS...';
        });
        final newLocationStatus = await Permission.location.request();
        if (newLocationStatus != PermissionStatus.granted) {
          print('❌ Permission GPS refusée: $newLocationStatus');
          setState(() {
            _gpsPermissionGranted = false;
            _gpsStatus = 'Permission GPS refusée';
          });
          _showError('❌ Permission GPS requise pour le pointage. Veuillez autoriser l\'accès à la localisation dans les paramètres.');
          return;
        }
        print('✅ Permission GPS accordée');
        setState(() {
          _gpsPermissionGranted = true;
          _gpsStatus = 'GPS activé';
        });
      } else {
        setState(() {
          _gpsPermissionGranted = true;
          _gpsStatus = 'GPS activé';
        });
      }
      
      // Demander les permissions caméra si nécessaire
      if (cameraStatus != PermissionStatus.granted) {
        print('📷 Demande permission caméra...');
        final newCameraStatus = await Permission.camera.request();
        if (newCameraStatus != PermissionStatus.granted) {
          print('❌ Permission caméra refusée: $newCameraStatus');
          setState(() {
            _cameraPermissionGranted = false;
          });
          _showError('❌ Permission caméra requise pour le scan QR. Veuillez autoriser l\'accès à la caméra.');
          return;
        }
        print('✅ Permission caméra accordée');
        setState(() {
          _cameraPermissionGranted = true;
        });
      } else {
        setState(() {
          _cameraPermissionGranted = true;
        });
      }
      
      print('✅ Toutes les permissions accordées');
    } catch (e) {
      print('❌ Erreur lors de la demande de permissions: $e');
      _showError('❌ Erreur lors de la demande de permissions: $e');
    }
  }

  Future<void> _getCurrentLocation() async {
    try {
      print('📍 Récupération automatique de la position GPS...');
      
      // Vérifier les permissions GPS
      final locationPermission = await Permission.location.status;
      if (locationPermission != PermissionStatus.granted) {
        print('⚠️ Permission GPS non accordée, demande...');
        final newStatus = await Permission.location.request();
        if (newStatus != PermissionStatus.granted) {
          _showError('❌ Permission GPS requise pour le pointage. Veuillez autoriser l\'accès à la localisation.');
          return;
        }
      }
      
      // Vérifier si la géolocalisation est activée
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        print('❌ Services de localisation désactivés');
        _showError('❌ Services de localisation désactivés. Veuillez activer le GPS dans les paramètres du téléphone.');
        return;
      }
      
      print('🔍 Tentative de récupération de la position...');
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 20),
      );
      
      setState(() {
        _currentPosition = position;
      });
      
      print('✅ Position GPS récupérée: ${position.latitude}, ${position.longitude}');
    } catch (e) {
      print('❌ Erreur récupération position GPS: $e');
      String errorMessage = '❌ Impossible de récupérer la position GPS du téléphone';
      
      if (e.toString().contains('timeout')) {
        errorMessage = '❌ Timeout GPS: Impossible de récupérer la position dans les 20 secondes. Vérifiez que le GPS est activé.';
      } else if (e.toString().contains('permission')) {
        errorMessage = '❌ Permission GPS refusée. Veuillez autoriser l\'accès à la localisation dans les paramètres.';
      } else if (e.toString().contains('location service disabled')) {
        errorMessage = '❌ Services de localisation désactivés. Veuillez activer le GPS dans les paramètres du téléphone.';
      } else if (e.toString().contains('location unavailable')) {
        errorMessage = '❌ Localisation indisponible. Vérifiez que vous êtes dans une zone avec signal GPS.';
      }
      
      _showError(errorMessage);
    }
  }

  // Calculer la distance entre deux points GPS (formule de Haversine)
  double _calculateDistance(double lat1, double lng1, double lat2, double lng2) {
    const double earthRadius = 6371000; // Rayon de la Terre en mètres
    
    final double dLat = _degreesToRadians(lat2 - lat1);
    final double dLng = _degreesToRadians(lng2 - lng1);
    
    final double a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_degreesToRadians(lat1)) * math.cos(_degreesToRadians(lat2)) *
        math.sin(dLng / 2) * math.sin(dLng / 2);
    
    final double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    
    return earthRadius * c; // Distance en mètres
  }

  double _degreesToRadians(double degrees) {
    return degrees * (math.pi / 180);
  }

  void _onDetect(BarcodeCapture capture) {
    if (!_isScanning || _isProcessing) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isNotEmpty) {
      // Automatiser le scan - traiter immédiatement
      _processQRCode(barcodes.first.rawValue ?? '');
    }
  }

  Future<void> _processQRCode(String qrData) async {
    setState(() {
      _isProcessing = true;
    });

    try {
      print('QR Code reçu: $qrData');
      print('Longueur QR: ${qrData.length} caractères');
      
      // Parser le JSON du QR code
      Map<String, dynamic> qrJson;
      try {
        qrJson = jsonDecode(qrData);
        print('QR JSON parsé: $qrJson');
        print('Clés disponibles: ${qrJson.keys.toList()}');
      } catch (e) {
        print('Erreur parsing JSON: $e');
        _showError('QR code invalide: Format JSON incorrect');
        return;
      }

      // Vérifier l'expiration du QR code (30 secondes)
      if (qrJson.containsKey('timestamp')) {
        try {
          final qrTimestamp = DateTime.parse(qrJson['timestamp']);
          final now = DateTime.now();
          final difference = now.difference(qrTimestamp).inSeconds;
          
          if (difference > 30) {
            _showError('QR code expiré (plus de 30 secondes)');
            return;
          }
          
          print('QR code valide: ${30 - difference} secondes restantes');
        } catch (e) {
          print('Erreur parsing timestamp: $e');
        }
      }

      // Extraire les données selon le format
      int siteId, planningId, timesheetTypeId;
      String siteName = '';
      int? employeeId;
      
             // Format Vercel exact (userId + userName + planningId + timeSheetId)
       if (qrJson.containsKey('userId') && qrJson.containsKey('userName') && qrJson.containsKey('planningId')) {
         siteId = 1; // Site par défaut
         planningId = qrJson['planningId'];
         timesheetTypeId = qrJson['timeSheetTypeId'] ?? 1;
         siteName = 'test'; // Site fixe pour correspondre au QR
         employeeId = qrJson['userId']; // ID de l'utilisateur spécifique
         print('Format détecté: Vercel (exact)');
         print('  userId: ${qrJson['userId']}');
         print('  userName: ${qrJson['userName']}');
         print('  planningId: ${qrJson['planningId']}');
         print('  timeSheetTypeId: ${qrJson['timeSheetTypeId']}');
         print('  siteName: $siteName');
       }
      // Format Vercel (site + employé) - Format complet
      else if (qrJson.containsKey('siteId') && qrJson.containsKey('planningId') && qrJson.containsKey('timesheetTypeId')) {
        siteId = qrJson['siteId'];
        planningId = qrJson['planningId'];
        timesheetTypeId = qrJson['timesheetTypeId'];
        siteName = qrJson['siteName'] ?? 'Site inconnu';
        employeeId = qrJson['employeeId']; // ID de l'employé spécifique
        print('Format détecté: Vercel (complet)');
      }
      // Format Vercel (site + employé) - Format sans employeeId
      else if (qrJson.containsKey('siteId') && qrJson.containsKey('planningId')) {
        siteId = qrJson['siteId'];
        planningId = qrJson['planningId'];
        timesheetTypeId = qrJson['timesheetTypeId'] ?? 1;
        siteName = qrJson['siteName'] ?? 'Site inconnu';
        print('Format détecté: Vercel (sans employeeId)');
      }
      // Format raccourci (notre app)
      else if (qrJson.containsKey('uid') && qrJson.containsKey('pid')) {
        siteId = 1; // Site par défaut
        planningId = qrJson['pid'];
        timesheetTypeId = 1; // Type par défaut
        siteName = 'Site par défaut';
        print('Format détecté: raccourci');
      }
      // Format inconnu - Essayons avec des valeurs par défaut
      else {
        print('❌ Format non reconnu, utilisation des valeurs par défaut');
        print('QR JSON reçu: $qrJson');
        print('Clés disponibles: ${qrJson.keys.toList()}');
        print('Recherche des clés spécifiques:');
        print('  userId: ${qrJson.containsKey('userId')}');
        print('  userName: ${qrJson.containsKey('userName')}');
        print('  planningId: ${qrJson.containsKey('planningId')}');
        print('  timeSheetTypeId: ${qrJson.containsKey('timeSheetTypeId')}');
        print('  timeSheetId: ${qrJson.containsKey('timeSheetId')}');
        siteId = 1;
        planningId = 5;
        timesheetTypeId = 1;
        siteName = 'Site par défaut';
      }

      // Extraire la géolocalisation du QR si disponible
      double? qrLatitude, qrLongitude;
      if (qrJson.containsKey('location') && qrJson['location'] is Map) {
        final location = qrJson['location'] as Map;
        qrLatitude = location['latitude']?.toDouble();
        qrLongitude = location['longitude']?.toDouble();
        print('Géolocalisation QR: $qrLatitude, $qrLongitude');
      }

      // Validation géographique automatique
      if (qrLatitude != null && qrLongitude != null) {
        print('📍 Validation géographique automatique...');
        
        // Récupérer automatiquement la position GPS du téléphone
        await _getCurrentLocation();
        
        if (_currentPosition != null) {
          final currentLat = _currentPosition!.latitude;
          final currentLng = _currentPosition!.longitude;
          
          print('📱 Position téléphone: $currentLat, $currentLng');
          print('🏢 Position site (QR): $qrLatitude, $qrLongitude');
          
          // Calculer automatiquement la distance
          final distance = _calculateDistance(
            qrLatitude, qrLongitude,
            currentLat, currentLng
          );
          
          print('📏 Distance calculée: ${distance.toStringAsFixed(2)} mètres');
          
          // Validation automatique (rayon de 100 mètres)
          if (distance > 100) {
            _showError('❌ Trop loin du site de travail (${distance.toStringAsFixed(0)}m > 100m)');
            return;
          }
          
          print('✅ Validation géographique réussie - Distance: ${distance.toStringAsFixed(2)}m');
          _showSuccess('📍 Position validée - Distance: ${distance.toStringAsFixed(0)}m');
        } else {
          _showError('❌ Impossible de récupérer la position GPS du téléphone');
          return;
        }
      } else {
        print('⚠️ Pas de géolocalisation dans le QR - Validation ignorée');
      }

      print('Données extraites:');
      print('  SiteId: $siteId');
      print('  PlanningId: $planningId');
      print('  TimesheetTypeId: $timesheetTypeId');
      print('  SiteName: $siteName');
      print('  EmployeeId: $employeeId');
      print('  QR Latitude: $qrLatitude');
      print('  QR Longitude: $qrLongitude');

      // Vérifier que l'employé actuel correspond à celui du QR
      final currentUser = _apiService.currentUser;
      if (employeeId != null && currentUser != null && currentUser.id != employeeId) {
        _showError('QR code invalide: Employé non autorisé');
        return;
      }

      // Créer automatiquement le timesheet après validation
      print('🔄 Création automatique du timesheet...');
      await _createTimesheet(
        siteId: siteId,
        planningId: planningId,
        timesheetTypeId: timesheetTypeId,
        qrData: qrData,
        qrLatitude: qrLatitude,
        qrLongitude: qrLongitude,
      );
    } catch (e) {
      print('Erreur lors du traitement: $e');
      _showError('Erreur lors du traitement du QR code');
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  Future<void> _createTimesheet({
    required int siteId,
    required int planningId,
    required int timesheetTypeId,
    required String qrData,
    double? qrLatitude,
    double? qrLongitude,
  }) async {
    try {
      final user = _apiService.currentUser;
      if (user == null) {
        _showError('Utilisateur non connecté');
        return;
      }

      const uuid = Uuid();
      final uniqueCode = uuid.v4().substring(0, 8).toUpperCase();

      // Créer des détails raccourcis pour respecter la limite de 256 caractères
      final details = {
        'uid': user.id, // ID de l'employé réel (202 pour JACKSON)
        'un': user.displayName,
        'pid': planningId,
        'ts': DateTime.now().millisecondsSinceEpoch,
        'lat': _currentPosition?.latitude ?? qrLatitude ?? 0.0, // Priorité à la position actuelle
        'lng': _currentPosition?.longitude ?? qrLongitude ?? 0.0,
      };

      final detailsJson = jsonEncode(details);

      final timesheet = await _apiService.createTimesheet(
        code: uniqueCode,
        details: detailsJson,
        planningId: planningId,
        timesheetTypeId: timesheetTypeId,
      );

      if (timesheet != null) {
        _showSuccess('✅ Pointage automatique enregistré avec succès!');
        print('✅ Timesheet créé avec ID: ${timesheet.id}');
        
        // Retour automatique après 3 secondes
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) Navigator.pop(context);
        });
      } else {
        _showError('❌ Échec de l\'enregistrement automatique');
      }
    } catch (e) {
      _showError('Erreur: $e');
    }
  }

  void _showSuccess(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.green),
      );
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scanner QR'),
        backgroundColor: const Color(0xFF1976D2),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Indicateur de statut des permissions
          Container(
            padding: const EdgeInsets.all(8.0),
            color: Colors.grey[100],
            child: Row(
              children: [
                Icon(
                  _gpsPermissionGranted ? Icons.location_on : Icons.location_off,
                  color: _gpsPermissionGranted ? Colors.green : Colors.red,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _gpsStatus,
                    style: TextStyle(
                      color: _gpsPermissionGranted ? Colors.green : Colors.red,
                      fontSize: 12,
                    ),
                  ),
                ),
                Icon(
                  _cameraPermissionGranted ? Icons.camera_alt : Icons.camera_alt_outlined,
                  color: _cameraPermissionGranted ? Colors.green : Colors.red,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  _cameraPermissionGranted ? 'Caméra OK' : 'Caméra KO',
                  style: TextStyle(
                    color: _cameraPermissionGranted ? Colors.green : Colors.red,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          // Option de saisie manuelle pour le web
          if (kIsWeb)
            Container(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  const Text(
                    'Saisie manuelle (pour navigateur)',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _qrCodeController,
                    decoration: const InputDecoration(
                      labelText: 'Code QR',
                      hintText: 'Collez ou tapez le code QR ici',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton.icon(
                    onPressed: () {
                      if (_qrCodeController.text.isNotEmpty) {
                        _processQRCode(_qrCodeController.text);
                      }
                    },
                    icon: const Icon(Icons.input),
                    label: const Text('Valider et Pointer'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1976D2),
                      foregroundColor: Colors.white,
                    ),
                  ),
                  const Divider(height: 32),
                ],
              ),
            ),
          // Scanner caméra (pour mobile)
          Expanded(
            child: Stack(
              children: [
                MobileScanner(
                  controller: controller,
                  onDetect: _onDetect,
                  overlay: const QRScannerOverlay(),
                ),
                if (_isProcessing)
                  Container(
                    color: Colors.black54,
                    child: const Center(
                      child: Card(
                        child: Padding(
                          padding: EdgeInsets.all(20.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(),
                              SizedBox(height: 16),
                              Text('Traitement en cours...'),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            onPressed: () => controller?.toggleTorch(),
            child: const Icon(Icons.flash_on),
          ),
          const SizedBox(width: 16),
          FloatingActionButton(
            onPressed: () => controller?.switchCamera(),
            child: const Icon(Icons.switch_camera),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }
}

class QRScannerOverlay extends StatelessWidget {
  const QRScannerOverlay({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Center(
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              border: Border.all(
                color: const Color(0xFF1976D2),
                width: 3,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
      ],
    );
  }
} 