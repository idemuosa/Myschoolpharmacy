import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/drug_provider.dart';

class DrugListScreen extends StatefulWidget {
  const DrugListScreen({super.key});

  @override
  State<DrugListScreen> createState() => _DrugListScreenState();
}

class _DrugListScreenState extends State<DrugListScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(Duration.zero, () {
      context.read<DrugProvider>().fetchDrugs();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pharmacy Inventory'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<DrugProvider>().fetchDrugs(),
          ),
        ],
      ),
      body: Consumer<DrugProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 60),
                    const SizedBox(height: 16),
                    Text(
                      'Failed to load drugs: ${provider.error}',
                      textAlign: TextAlign.center,
                    ),
                    ElevatedButton(
                      onPressed: () => provider.fetchDrugs(),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (provider.drugs.isEmpty) {
            return const Center(child: Text('No drugs found.'));
          }

          return ListView.builder(
            itemCount: provider.drugs.length,
            itemBuilder: (context, index) {
              final drug = provider.drugs[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  title: Text(drug.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(drug.categoryName),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('Stock: ${drug.stock}', 
                        style: TextStyle(
                          color: drug.stock < 10 ? Colors.red : Colors.green,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text('₦${drug.price.toStringAsFixed(2)}'),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
