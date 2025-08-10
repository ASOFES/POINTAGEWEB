import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../services/api_service.dart';
import '../models/user.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  MobileScannerController cameraController = MobileScannerController();
  bool _isProcessing = false;
  bool _scannerActive = true;
  String? _lastScannedData;
  DateTime? _lastScanTime;
  User? _currentUser;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  @override
  void dispose() {
    cameraController.dispose();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    try {
      final user = await ApiService.getUser();
      setState(() {
        _currentUser = user;
      });
    } catch (e) {
      print('Error loading user: $e');
    }
  }

  void _onQRCodeDetected(BarcodeCapture capture) async {
    // 🔒 PROTECTION DE SÉCURITÉ MULTI-NIVEAUX (INSPIRÉE DE VOTRE VERSION WEB)
    if (_isProcessing) {
      print('🚫 BLOQUÉ: Traitement en cours, scan ignoré');
      return;
    }

    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final String? qrData = barcodes.first.rawValue;
    if (qrData == null || qrData.isEmpty) return;

    // 🔒 PROTECTION ANTI-DOUBLON RENFORCÉE
    final now = DateTime.now();
    if (_lastScannedData == qrData && 
        _lastScanTime != null && 
        now.difference(_lastScanTime!).inMilliseconds < 500) {  // 🔧 RÉDUIT À 500ms comme votre web
      print('🔄 BLOQUÉ: Même QR scanné récemment, scan ignoré');
      return;
    }

    // 🔒 VERROUILLAGE TOTAL IMMÉDIAT
    setState(() {
      _isProcessing = true;
      _scannerActive = false;  // 🔒 DÉSACTIVATION IMMÉDIATE
      _lastScannedData = qrData;
      _lastScanTime = now;
    });

    print('🔒 VERROUILLAGE TOTAL: Scanner complètement désactivé');
    print('📱 QR Code detected: $qrData');

    try {
      await _processQRCode(qrData);
    } catch (e) {
      print('❌ Error processing QR: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      // 🔓 DÉVERROUILLAGE CONTRÔLÉ
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _scannerActive = false; // 🔒 RESTE DÉSACTIVÉ APRÈS TRAITEMENT
        });
        
        // 🔓 RÉACTIVATION APRÈS DÉLAI (comme votre web)
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) {
            setState(() {
              _scannerActive = true;
              _lastScannedData = null;
            });
            print('🔓 DÉVERROUILLAGE: Scanner réactivé pour nouveau scan');
          }
        });
      }
    }
  }

  Future<void> _processQRCode(String qrData) async {
    try {
      if (_currentUser == null) {
        throw Exception('Utilisateur non connecté');
      }

      // 🔒 VÉRIFICATION ANTI-DOUBLON (COMME VOTRE VERSION WEB)
      print('🔍 Vérification anti-doublon pour QR: $qrData');
      final alreadyUsed = await ApiService.checkQRUsedToday(qrData, _currentUser!.id);
      if (alreadyUsed) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('⚠️ Vous avez déjà pointé avec ce QR code aujourd\'hui !'),
              backgroundColor: Colors.orange,
              duration: Duration(seconds: 4),
            ),
          );
        }
        print('🚫 DOUBLON DÉTECTÉ: QR déjà utilisé aujourd\'hui par cet utilisateur');
        return;
      }

      // PARSING QR - LOGIQUE COPIÉE DE VOTRE APK QUI MARCHE
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
        throw Exception('QR code invalide: Format JSON incorrect');
      }

      // Extraire les données selon le format - COMME VOTRE APK
      int siteId, planningId, timesheetTypeId;
      String siteName = '';
      int? employeeId;
      
      // Format Vercel exact (userId + userName + planningId + timeSheetId) - VOTRE FORMAT
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
        siteId = 1;
        planningId = 5;
        timesheetTypeId = 1;
        siteName = 'Site par défaut';
      }

      print('🎯 Processing timesheet: Site $siteId, Planning $planningId, Type $timesheetTypeId');

      // Create timesheet
      final result = await ApiService.createTimesheet(
        siteId: siteId,
        planningId: planningId,
        timesheetTypeId: timesheetTypeId,
        qrData: qrData,
      );

      if (result['success'] == true && mounted) {
        _showSuccessDialog('✅ Pointage réussi !', 'Votre pointage a été enregistré avec succès.');
      }
    } catch (e) {
      print('❌ Error processing QR: $e');
      if (mounted) {
        _showErrorDialog('❌ Erreur de pointage', e.toString());
      }
    }
  }

  void _showSuccessDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context); // Return to dashboard
            },
            child: const Text('Retour'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Reset scanner for another scan
              setState(() {
                _scannerActive = true;
                _lastScannedData = null;
              });
            },
            child: const Text('Nouveau scan'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Reset scanner
              setState(() {
                _scannerActive = true;
                _lastScannedData = null;
              });
            },
            child: const Text('Réessayer'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context); // Return to dashboard
            },
            child: const Text('Retour'),
          ),
        ],
      ),
    );
  }

  void _toggleFlash() {
    cameraController.toggleTorch();
  }

  void _resetScanner() {
    setState(() {
      _isProcessing = false;
      _scannerActive = true;
      _lastScannedData = null;
      _lastScanTime = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Scanner QR',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF667eea),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: _toggleFlash,
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _resetScanner,
          ),
        ],
      ),
      body: Stack(
        children: [
          // Scanner View
          MobileScanner(
            controller: cameraController,
            onDetect: _scannerActive ? _onQRCodeDetected : (capture) {},
          ),

          // Scanner Overlay
          Container(
            decoration: ShapeDecoration(
              shape: QrScannerOverlayShape(
                borderColor: const Color(0xFF667eea),
                borderRadius: 10,
                borderLength: 30,
                borderWidth: 5,
                cutOutSize: 250,
              ),
            ),
          ),

          // Status Overlay
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: Card(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text(
                          '⏳ Traitement en cours...',
                          style: TextStyle(fontSize: 16),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Veuillez patienter',
                          style: TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

          // Instructions
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              color: Colors.black87,
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _scannerActive 
                      ? '📱 Placez le QR code dans le cadre'
                      : _isProcessing 
                        ? '⏳ Traitement en cours...'
                        : '✅ QR code détecté !',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _scannerActive 
                      ? 'Alignez bien le code pour un scan optimal'
                      : _isProcessing 
                        ? 'Validation du pointage en cours'
                        : 'Traitement terminé',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      // TODO: Implement manual entry
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Saisie manuelle - À implémenter'),
                        ),
                      );
                    },
                    icon: const Icon(Icons.edit),
                    label: const Text('Saisie manuelle'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white.withOpacity(0.2),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class QrScannerOverlayShape extends ShapeBorder {
  final Color borderColor;
  final double borderWidth;
  final Color overlayColor;
  final double borderRadius;
  final double borderLength;
  final double cutOutSize;

  const QrScannerOverlayShape({
    this.borderColor = Colors.red,
    this.borderWidth = 3.0,
    this.overlayColor = const Color.fromRGBO(0, 0, 0, 80),
    this.borderRadius = 0,
    this.borderLength = 40,
    this.cutOutSize = 250,
  });

  @override
  EdgeInsetsGeometry get dimensions => const EdgeInsets.all(10);

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) {
    return Path()
      ..fillType = PathFillType.evenOdd
      ..addPath(getOuterPath(rect), Offset.zero);
  }

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    Path getLeftTopPath(Rect rect) {
      return Path()
        ..moveTo(rect.left, rect.bottom)
        ..lineTo(rect.left, rect.top + borderRadius)
        ..quadraticBezierTo(rect.left, rect.top, rect.left + borderRadius, rect.top)
        ..lineTo(rect.right, rect.top);
    }

    return getLeftTopPath(rect)
      ..lineTo(rect.right, rect.bottom)
      ..lineTo(rect.left, rect.bottom)
      ..lineTo(rect.left, rect.top);
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    final width = rect.width;
    final borderWidthSize = width / 2;
    final height = rect.height;
    final borderHeightSize = height / 2;
    final cutOutWidth = cutOutSize < width ? cutOutSize : width - borderWidth;
    final cutOutHeight = cutOutSize < height ? cutOutSize : height - borderWidth;

    final backgroundPaint = Paint()
      ..color = overlayColor
      ..style = PaintingStyle.fill;

    final boxPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = borderWidth;

    final cutOutRect = Rect.fromLTWH(
      borderWidthSize - cutOutWidth / 2,
      borderHeightSize - cutOutHeight / 2,
      cutOutWidth,
      cutOutHeight,
    );

    canvas
      ..saveLayer(
        rect,
        backgroundPaint,
      )
      ..drawRect(rect, backgroundPaint)
      ..drawRRect(
        RRect.fromRectAndCorners(
          cutOutRect,
          topLeft: Radius.circular(borderRadius),
          topRight: Radius.circular(borderRadius),
          bottomLeft: Radius.circular(borderRadius),
          bottomRight: Radius.circular(borderRadius),
        ),
        backgroundPaint..blendMode = BlendMode.clear,
      )
      ..restore();



    // Top left corner
    canvas.drawPath(
      Path()
        ..moveTo(cutOutRect.left, cutOutRect.top + borderLength)
        ..lineTo(cutOutRect.left, cutOutRect.top + borderRadius)
        ..quadraticBezierTo(cutOutRect.left, cutOutRect.top, cutOutRect.left + borderRadius, cutOutRect.top)
        ..lineTo(cutOutRect.left + borderLength, cutOutRect.top),
      boxPaint,
    );

    // Top right corner
    canvas.drawPath(
      Path()
        ..moveTo(cutOutRect.right - borderLength, cutOutRect.top)
        ..lineTo(cutOutRect.right - borderRadius, cutOutRect.top)
        ..quadraticBezierTo(cutOutRect.right, cutOutRect.top, cutOutRect.right, cutOutRect.top + borderRadius)
        ..lineTo(cutOutRect.right, cutOutRect.top + borderLength),
      boxPaint,
    );

    // Bottom right corner
    canvas.drawPath(
      Path()
        ..moveTo(cutOutRect.right, cutOutRect.bottom - borderLength)
        ..lineTo(cutOutRect.right, cutOutRect.bottom - borderRadius)
        ..quadraticBezierTo(cutOutRect.right, cutOutRect.bottom, cutOutRect.right - borderRadius, cutOutRect.bottom)
        ..lineTo(cutOutRect.right - borderLength, cutOutRect.bottom),
      boxPaint,
    );

    // Bottom left corner
    canvas.drawPath(
      Path()
        ..moveTo(cutOutRect.left + borderLength, cutOutRect.bottom)
        ..lineTo(cutOutRect.left + borderRadius, cutOutRect.bottom)
        ..quadraticBezierTo(cutOutRect.left, cutOutRect.bottom, cutOutRect.left, cutOutRect.bottom - borderRadius)
        ..lineTo(cutOutRect.left, cutOutRect.bottom - borderLength),
      boxPaint,
    );
  }

  @override
  ShapeBorder scale(double t) {
    return QrScannerOverlayShape(
      borderColor: borderColor,
      borderWidth: borderWidth,
      overlayColor: overlayColor,
    );
  }
}
