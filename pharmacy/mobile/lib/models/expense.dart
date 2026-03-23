class Expense {
  final int id;
  final String category;
  final double amount;
  final String description;
  final DateTime date;
  final String? staffName;

  Expense({
    required this.id,
    required this.category,
    required this.amount,
    required this.description,
    required this.date,
    this.staffName,
  });

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id'],
      category: json['category'],
      amount: double.tryParse(json['amount']?.toString() ?? '0.0') ?? 0.0,
      description: json['description'] ?? '',
      date: DateTime.parse(json['date']),
      staffName: json['staff_name'],
    );
  }
}
