import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/drug.dart';

class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://10.0.2.2:8000/api/', // For Android Emulator
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  ApiService() {
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
          // You might want to trigger a logout here via a callback
        }
        return handler.next(e);
      },
    ));
  }

  Future<List<Drug>> getDrugs() async {
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
    try {
      await _dio.post('expenses/', data: data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteExpense(int id) async {
    try {
      await _dio.delete('expenses/$id/');
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getFinancialSummary() async {
    try {
      final response = await _dio.get('expenses/financial-summary/');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }
}
