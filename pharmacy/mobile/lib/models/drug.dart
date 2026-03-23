class Drug {
  final int id;
  final String name;
  final String? genericName;
  final String categoryName;
  final String? dosage;
  final double price;
  final int stock;
  final int reorderLevel;
  final DateTime? expiryDate;
  final String? barcode;

  Drug({
    required this.id,
    required this.name,
    this.genericName,
    required this.categoryName,
    this.dosage,
    required this.price,
    required this.stock,
    required this.reorderLevel,
    this.expiryDate,
    this.barcode,
  });

  factory Drug.fromJson(Map<String, dynamic> json) {
    return Drug(
      id: json['id'],
      name: json['name'],
      genericName: json['generic_name'],
      categoryName: json['category_name'] ?? 'Uncategorized',
      dosage: json['dosage'],
      price: double.tryParse(json['unit_price']?.toString() ?? '0.0') ?? 0.0,
      stock: json['stock'] ?? 0,
      reorderLevel: json['reorder_level'] ?? 10,
      expiryDate: json['expiry_date'] != null ? DateTime.parse(json['expiry_date']) : null,
      barcode: json['barcode'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'generic_name': genericName,
      'dosage': dosage,
      'unit_price': price,
      'stock': stock,
      'reorder_level': reorderLevel,
      'expiry_date': expiryDate?.toIso8601String(),
      'barcode': barcode,
    };
  }
}
