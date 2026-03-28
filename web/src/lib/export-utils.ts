/**
 * Utility to export JSON data to CSV and trigger a download in the browser.
 */
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
    if (!data.length) return;

    // Extract headers if not provided
    const cols = headers || Object.keys(data[0]);
    
    // Create CSV content
    const csvRows = [];
    
    // Add header row
    csvRows.push(cols.join(','));
    
    // Add data rows
    for (const row of data) {
        const values = cols.map(col => {
            const val = row[col];
            // Handle nulls, commas, and quotes
            if (val === null || val === undefined) return '';
            const escaped = ('' + val).replace(/"/g, '""');
            return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
                ? `"${escaped}"` 
                : escaped;
        });
        csvRows.push(values.join(','));
    }
    
    // Create blob and trigger download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
