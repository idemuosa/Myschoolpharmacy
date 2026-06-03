import 'dart:io';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/drug.dart';

class ApiService {
  static const String _productionUrl = 'https://pharmacy-api-exn3.onrender.com/api/';
  
  static Future<String> get _baseUrl async {
    final prefs = await SharedPreferences.getInstance();
    final customUrl = prefs.getString('api_base_url');
    
    if (customUrl != null && customUrl.isNotEmpty) {
      return customUrl.endsWith('/') ? customUrl : '$customUrl/';
    }

    // Default fallbacks for development
    if (Platform.isAndroid) {
      // Check if we are in a debug environment or use production by default
      // For now, let's prioritize production since we are focusing on production config
      return _productionUrl; 
    } else {
      return 'http://localhost:8000/api/';
    }
  }

  late Dio _dio;
  bool _initialized = false;

  Future<void> _init() async {
    if (_initialized) return;
    
    final baseUrl = await _baseUrl;
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        if (e.response?.statusCode == 401) {
          // Token expired or invalid
        }
        return handler.next(e);
      },
    ));
    
    _initialized = true;
  }

  Future<List<Drug>> getDrugs() async {
    await _init();
    try {
      final response = await _dio.get('drugs/');
      if (response.statusCode == 200) {
        final List<dynamic> data;
        if (response.data is Map) {
          data = response.data['results'] ?? [];
        } else if (response.data is List) {
          data = response.data;
        } else {
          data = [];
        }
        return data.map((json) => Drug.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load drugs');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getExpenses() async {
    await _init();
    try {
      final response = await _dio.get('expenses/');
      final List<dynamic> data;
      if (response.data is Map) {
        data = response.data['results'] ?? [];
      } else if (response.data is List) {
        data = response.data;
      } else {
        data = [];
      }
      return data.cast<Map<String, dynamic>>();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> addExpense(Map<String, dynamic> data) async {
    await _init();
    try {
      await _dio.post('expenses/', data: data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteExpense(int id) async {
    await _init();
    try {
      await _dio.delete('expenses/$id/');
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getFinancialSummary() async {
    await _init();
    try {
      final response = await _dio.get('expenses/financial-summary/');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }
}
