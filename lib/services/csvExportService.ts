/**
 * CSV Export Service
 * Provides utilities for exporting data to CSV format
 */

export interface ExportColumn {
  header: string;
  key: string;
  format?: (value: unknown) => string;
}

export class CSVExportService {
  /**
   * Converts an array of objects to CSV format
   */
  static objectsToCSV<T extends Record<string, unknown>>(
    data: T[],
    columns: ExportColumn[]
  ): string {
    if (data.length === 0) {
      return columns.map(col => this.escapeCSVValue(col.header)).join(',');
    }

    // Header row
    const headers = columns.map(col => this.escapeCSVValue(col.header)).join(',');

    // Data rows
    const rows = data.map(row => {
      return columns.map(col => {
        const value = row[col.key];
        const formattedValue = col.format ? col.format(value) : value;
        return this.escapeCSVValue(formattedValue);
      }).join(',');
    });

    return [headers, ...rows].join('\n');
  }

  /**
   * Escapes and formats a value for CSV
   */
  private static escapeCSVValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '""';
    }

    const stringValue = String(value);

    // If the value contains comma, newline, or quote, wrap it in quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      // Escape quotes by doubling them
      const escaped = stringValue.replace(/"/g, '""');
      return `"${escaped}"`;
    }

    return `"${stringValue}"`;
  }

  /**
   * Triggers a browser download of CSV data
   */
  static downloadCSV(csvContent: string, filename: string): void {
    // Add BOM for Excel UTF-8 support
    const BOM = '\ufeff';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Formats a date for CSV export
   */
  static formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formats a date for CSV export (date only, no time)
   */
  static formatDateOnly(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Formats a boolean for CSV export
   */
  static formatBoolean(value: boolean | null | undefined): string {
    if (value === null || value === undefined) return '';
    return value ? 'Oui' : 'Non';
  }

  /**
   * Formats currency for CSV export
   */
  static formatCurrency(value: number | null | undefined, currency = 'XAF'): string {
    if (value === null || value === undefined) return '';
    return `${value.toLocaleString('fr-FR')} ${currency}`;
  }

  /**
   * Truncates long text for CSV export
   */
  static truncateText(text: string | null | undefined, maxLength = 100): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
