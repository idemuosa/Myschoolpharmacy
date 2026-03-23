import 'package:flutter/material.dart';
import '../models/drug.dart';
import '../services/api_service.dart';

class DrugProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<Drug> _drugs = [];
  bool _isLoading = false;
  String? _error;
  String _filter = 'All'; // All, Low Stock, 30 Days Expiry, 100 Days Expiry

  List<Drug> get drugs {
    List<Drug> filtered = [..._drugs];
    
    // Apply Filter
    if (_filter == 'Low Stock') {
      filtered = filtered.where((d) => d.stock <= d.reorderLevel).toList();
    } else if (_filter == '30 Days Expiry') {
      final now = DateTime.now();
      filtered = filtered.where((d) => d.expiryDate != null && 
          d.expiryDate!.difference(now).inDays <= 30 &&
          d.expiryDate!.isAfter(now)).toList();
    } else if (_filter == '100 Days Expiry') {
      final now = DateTime.now();
      filtered = filtered.where((d) => d.expiryDate != null && 
          d.expiryDate!.difference(now).inDays <= 100 &&
          d.expiryDate!.isAfter(now)).toList();
    }

    // FEFO Sorting: Expiry Date Soonest First
    filtered.sort((a, b) {
      if (a.expiryDate == null) return 1;
      if (b.expiryDate == null) return -1;
      return a.expiryDate!.compareTo(b.expiryDate!);
    });

    return filtered;
  }

  bool get isLoading => _isLoading;
  String? get error => _error;
  String get currentFilter => _filter;

  void setFilter(String filter) {
    _filter = filter;
    notifyListeners();
  }

  Future<void> fetchDrugs() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _drugs = await _apiService.getDrugs();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
