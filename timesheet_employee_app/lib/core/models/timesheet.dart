class Timesheet {
  final int id;
  final String code;
  final DateTime start;
  final DateTime? end;
  final String details;
  final int planningId;
  final int? timesheetTypeId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isDeleted;

  Timesheet({
    required this.id,
    required this.code,
    required this.start,
    this.end,
    required this.details,
    required this.planningId,
    this.timesheetTypeId,
    required this.createdAt,
    required this.updatedAt,
    required this.isDeleted,
  });

  factory Timesheet.fromJson(Map<String, dynamic> json) {
    return Timesheet(
      id: json['id'] ?? 0,
      code: json['code']?.toString() ?? '',
      start: json['start'] != null ? DateTime.parse(json['start'].toString()) : DateTime.now(),
      end: json['end'] != null ? DateTime.parse(json['end'].toString()) : null,
      details: json['details']?.toString() ?? '',
      planningId: json['planningId'] ?? 0,
      timesheetTypeId: json['timesheetTypeId'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'].toString()) : DateTime.now(),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt'].toString()) : DateTime.now(),
      isDeleted: json['isDeleted'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'start': start.toIso8601String(),
      'end': end?.toIso8601String(),
      'details': details,
      'planningId': planningId,
      'timesheetTypeId': timesheetTypeId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isDeleted': isDeleted,
    };
  }

  // Méthode pour créer un nouveau pointage
  static Map<String, dynamic> createTimesheetData({
    required String code,
    required String details,
    required int planningId,
    required int timesheetTypeId,
    required double latitude,
    required double longitude,
    required int userId,
    required String userName,
  }) {
    return {
      'code': code,
      'details': details,
      'start': DateTime.now().toIso8601String(),
      'planningId': planningId,
      'timesheetTypeId': timesheetTypeId,
    };
  }

  // Méthode pour créer les détails JSON
  static String createDetailsJson({
    required int userId,
    required String userName,
    required int planningId,
    required double latitude,
    required double longitude,
  }) {
    final details = {
      'userId': userId,
      'userName': userName,
      'planningId': planningId,
      'timestamp': DateTime.now().toIso8601String(),
      'location': {
        'latitude': latitude,
        'longitude': longitude,
      },
    };
    
    return details.toString();
  }
} 