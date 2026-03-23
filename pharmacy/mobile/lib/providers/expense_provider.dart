import 'package:flutter/material.dart';
import '../models/expense.dart';
import '../services/api_service.dart';

class ExpenseProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<Expense> _expenses = [];
  Map<String, dynamic>? _summary;
  bool _isLoading = false;
  String? _error;

  List<Expense> get expenses => _expenses;
  Map<String, dynamic>? get summary => _summary;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchExpenses() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await _apiService.getExpenses();
      _expenses = data.map((json) => Expense.fromJson(json)).toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchSummary() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _summary = await _apiService.getFinancialSummary();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addExpense(String category, double amount, String description) async {
    try {
      await _apiService.addExpense({
        'category': category,
        'amount': amount,
        'description': description,
        'date': DateTime.now().toIso8601String().split('T')[0],
      });
      await fetchExpenses();
      await fetchSummary();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  Future<void> deleteExpense(int id) async {
    try {
      await _apiService.deleteExpense(id);
      await fetchExpenses();
      await fetchSummary();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    }
  }
}
