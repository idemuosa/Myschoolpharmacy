/**
 * Service to handle data exports (CSV)
 */
const exportService = {
  /**
   * Export JSON data to CSV and download it
   * @param {Array} data - Array of objects to export
   * @param {string} fileName - Name of the file (without extension)
   */
  exportToCSV: (data, fileName = 'export') => {
    if (!data || !data.length) {
      console.warn('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row =>
        headers.map(fieldName => {
          let value = row[fieldName];
          // Handle null/undefined
          if (value === null || value === undefined) return '""';
          // Handle objects/arrays
          if (typeof value === 'object') value = JSON.stringify(value);
          // Escape quotes and wrap in quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default exportService;
