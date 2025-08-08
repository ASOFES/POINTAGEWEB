class User {
  final int id;
  final String displayName;
  final String userName;
  final int? employeeId;
  final Employee? employee;

  User({
    required this.id,
    required this.displayName,
    required this.userName,
    this.employeeId,
    this.employee,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      displayName: json['displayName'] ?? '',
      userName: json['userName'] ?? '',
      employeeId: json['employeeId'],
      employee: json['employee'] != null 
          ? Employee.fromJson(json['employee']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'displayName': displayName,
      'userName': userName,
      'employeeId': employeeId,
      'employee': employee?.toJson(),
    };
  }
}

class Employee {
  final int id;
  final String matricule;
  final String firstName;
  final String lastName;
  final String placeOfBirth;
  final DateTime? dateOfBirth;
  final int? gender;
  final String? photo;
  final String? personalPhone;
  final String? personalEmail;
  final String? address;
  final String? notes;

  Employee({
    required this.id,
    required this.matricule,
    required this.firstName,
    required this.lastName,
    required this.placeOfBirth,
    this.dateOfBirth,
    this.gender,
    this.photo,
    this.personalPhone,
    this.personalEmail,
    this.address,
    this.notes,
  });

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'] ?? 0,
      matricule: json['matricule'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      placeOfBirth: json['placeOfBirth'] ?? '',
      dateOfBirth: json['dateOfBirth'] != null 
          ? DateTime.parse(json['dateOfBirth']) 
          : null,
      gender: json['gender'],
      photo: json['photo'],
      personalPhone: json['personalPhone'],
      personalEmail: json['personalEmail'],
      address: json['address'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'matricule': matricule,
      'firstName': firstName,
      'lastName': lastName,
      'placeOfBirth': placeOfBirth,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'gender': gender,
      'photo': photo,
      'personalPhone': personalPhone,
      'personalEmail': personalEmail,
      'address': address,
      'notes': notes,
    };
  }

  String get fullName => '$firstName $lastName';
} 