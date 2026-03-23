import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/expense_provider.dart';

class FinancialsScreen extends StatefulWidget {
  const FinancialsScreen({super.key});

  @override
  State<FinancialsScreen> createState() => _FinancialsScreenState();
}

class _FinancialsScreenState extends State<FinancialsScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(Duration.zero, () {
      context.read<ExpenseProvider>().fetchSummary();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Financial Overview')),
      body: RefreshIndicator(
        onRefresh: () => context.read<ExpenseProvider>().fetchSummary(),
        child: Consumer<ExpenseProvider>(
          builder: (context, provider, child) {
            if (provider.isLoading) return const Center(child: CircularProgressIndicator());
            final data = provider.summary;
            if (data == null) return const Center(child: Text('No data available'));

            final revenue = double.tryParse(data['revenue']?.toString() ?? '0') ?? 0;
            final expenses = double.tryParse(data['expenses']?.toString() ?? '0') ?? 0;
            final profit = double.tryParse(data['profit']?.toString() ?? '0') ?? 0;
            final balance = revenue - expenses;

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildStatCard('Total Revenue', '₦${revenue.toStringAsFixed(2)}', Colors.teal),
                const SizedBox(height: 16),
                _buildStatCard('Total Expenses', '₦${expenses.toStringAsFixed(2)}', Colors.red),
                const SizedBox(height: 16),
                _buildStatCard('Net Profit', '₦${profit.toStringAsFixed(2)}', Colors.blue),
                const SizedBox(height: 16),
                _buildStatCard('Balance', '₦${balance.toStringAsFixed(2)}', Colors.purple),
                const SizedBox(height: 24),
                const Text('Recent Sales Summary', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                const SizedBox(height: 8),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        _buildRow('Total Sales', data['sales_count']?.toString() ?? '0'),
                        const Divider(),
                        _buildRow('Avg Sale Value', '₦${(revenue / (int.tryParse(data['sales_count']?.toString() ?? '1')!)).toStringAsFixed(2)}'),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 24)),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
