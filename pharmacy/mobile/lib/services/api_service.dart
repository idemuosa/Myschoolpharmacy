import 'package:dio/dio.dart';
import '../models/drug.dart';

class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://10.0.2.2:8000/api/', // For Android Emulator
    // baseUrl: 'http://localhost:8000/api/', // For Web/iOS/Physical Device
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  Future<List<Drug>> getDrugs() async {
    try {
      final response = await _dio.get('drugs/');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Drug.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load drugs');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<Drug> getDrugDetails(int id) async {
    try {
      final response = await _dio.get('drugs/$id/');
      if (response.statusCode == 200) {
        return Drug.fromJson(response.data);
      } else {
        throw Exception('Failed to load drug details');
      }
    } catch (e) {
      rethrow;
    }
  }
}
