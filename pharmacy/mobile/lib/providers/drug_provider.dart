import 'package:flutter/material.dart';
import '../models/drug.dart';
import '../services/api_service.dart';

class DrugProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<Drug> _drugs = [];
  bool _isLoading = false;
  String? _error;

  List<Drug> get drugs => _drugs;
  bool get isLoading => _isLoading;
  String? get error => _error;

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
