import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/expense_provider.dart';

class ExpenseScreen extends StatefulWidget {
  const ExpenseScreen({super.key});

  @override
  State<ExpenseScreen> createState() => _ExpenseScreenState();
}

class _ExpenseScreenState extends State<ExpenseScreen> {
  final _formKey = GlobalKey<FormState>();
  String _category = 'Operations';
  double _amount = 0;
  String _description = '';

  @override
  void initState() {
    super.initState();
    Future.delayed(Duration.zero, () {
      context.read<ExpenseProvider>().fetchExpenses();
    });
  }

  void _showAddExpenseDialog() {
    String localCategory = 'Operations';
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            title: const Text('Add Expense'),
            content: Form(
              key: _formKey,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<String>(
                      value: localCategory,
                      items: ['Operations', 'Utility', 'Salary', 'Rent', 'Tax', 'Others']
                          .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                          .toList(),
                      onChanged: (v) {
                        if (v != null) {
                          setDialogState(() => localCategory = v);
                        }
                      },
                      decoration: const InputDecoration(labelText: 'Category'),
                    ),
                    TextFormField(
                      decoration: const InputDecoration(labelText: 'Amount (₦)'),
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (v) {
                        if (v == null || v.isEmpty) return 'Required';
                        if (double.tryParse(v) == null) return 'Enter a valid number';
                        return null;
                      },
                      onSaved: (v) => _amount = double.parse(v!),
                    ),
                    TextFormField(
                      decoration: const InputDecoration(labelText: 'Description'),
                      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                      onSaved: (v) => _description = v!,
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
              ElevatedButton(
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    _formKey.currentState!.save();
                    try {
                      await context.read<ExpenseProvider>().addExpense(localCategory, _amount, _description);
                      if (context.mounted) Navigator.pop(context);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Expense added')));
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                      }
                    }
                  }
                },
                child: const Text('Save'),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Expense Management')),
      body: Consumer<ExpenseProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) return const Center(child: CircularProgressIndicator());
          if (provider.expenses.isEmpty) return const Center(child: Text('No expenses recorded.'));

          return ListView.builder(
            itemCount: provider.expenses.length,
            itemBuilder: (context, index) {
              final exp = provider.expenses[index];
              return ListTile(
                title: Text(exp.description, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('${exp.category} • ${exp.date.toString().split(' ')[0]}'),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('₦${exp.amount.toStringAsFixed(2)}', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.grey, size: 20),
                      onPressed: () => provider.deleteExpense(exp.id),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddExpenseDialog,
        backgroundColor: Colors.teal,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
