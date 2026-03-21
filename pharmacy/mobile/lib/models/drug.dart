class Drug {
  final int id;
  final String name;
  final String categoryName;
  final double price;
  final int stock;
  final String? barcode;

  Drug({
    required this.id,
    required this.name,
    required this.categoryName,
    required this.price,
    required this.stock,
    this.barcode,
  });

  factory Drug.fromJson(Map<String, dynamic> json) {
    return Drug(
      id: json['id'],
      name: json['name'],
      categoryName: json['category_name'] ?? '',
      price: double.parse(json['price'].toString()),
      stock: json['stock'] ?? 0,
      barcode: json['barcode'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'stock': stock,
      'barcode': barcode,
    };
  }
}
