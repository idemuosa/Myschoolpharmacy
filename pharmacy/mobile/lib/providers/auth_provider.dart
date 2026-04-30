import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';

class AuthProvider with ChangeNotifier {
  String? _token;
  bool _isAuthenticated = false;
  final Dio _dio = Dio(BaseOptions(baseUrl: 'http://10.0.2.2:8000/api/')); // Adjust base URL as needed

  String? get token => _token;
  bool get isAuthenticated => _isAuthenticated;

  AuthProvider() {
    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    _isAuthenticated = _token != null;
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    try {
      final response = await _dio.post('token/', data: {
        'username': username,
        'password': password,
      });

      if (response.statusCode == 200) {
        _token = response.data['access'];
        _isAuthenticated = true;

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);

        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _isAuthenticated = false;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    notifyListeners();
  }
}
