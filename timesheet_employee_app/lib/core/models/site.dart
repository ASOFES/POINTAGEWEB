import 'dart:convert';
import 'dart:math' as math;

class Site {
  final int id;
  final String name;
  final int? provinceId;
  final int? cityId;
  final int? townId;
  final double? longitude;
  final double? latitude;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isDeleted;

  Site({
    required this.id,
    required this.name,
    this.provinceId,
    this.cityId,
    this.townId,
    this.longitude,
    this.latitude,
    required this.createdAt,
    required this.updatedAt,
    required this.isDeleted,
  });

  factory Site.fromJson(Map<String, dynamic> json) {
    return Site(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      provinceId: json['provinceId'],
      cityId: json['cityId'],
      townId: json['townId'],
      longitude: json['longitude']?.toDouble(),
      latitude: json['latitude']?.toDouble(),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      isDeleted: json['isDeleted'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'provinceId': provinceId,
      'cityId': cityId,
      'townId': townId,
      'longitude': longitude,
      'latitude': latitude,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isDeleted': isDeleted,
    };
  }

  double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
    const double earthRadius = 6371; // Rayon de la Terre en km
    
    final double deltaLat = _degreesToRadians(lat2 - lat1);
    final double deltaLng = _degreesToRadians(lng2 - lng1);
    
    final double a = math.sin(deltaLat / 2) * math.sin(deltaLat / 2) +
        math.cos(_degreesToRadians(lat1)) * math.cos(_degreesToRadians(lat2)) * 
        math.sin(deltaLng / 2) * math.sin(deltaLng / 2);
    final double c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    
    return earthRadius * c;
  }

  // Méthode pour calculer la distance entre deux points
  double? distanceTo(double lat, double lng) {
    if (latitude == null || longitude == null) return null;
    
    return calculateDistance(latitude!, longitude!, lat, lng);
  }

  // Méthode pour vérifier si un point est proche du site
  bool isNearby(double lat, double lng, {double maxDistance = 0.1}) {
    final distance = distanceTo(lat, lng);
    return distance != null && distance <= maxDistance;
  }

  double _degreesToRadians(double degrees) {
    return degrees * (math.pi / 180);
  }
} 