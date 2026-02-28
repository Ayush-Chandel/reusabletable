type ExportColumn<T> = {
  accessorKey: keyof T;
  header: string;
};

/**
 * Export data to CSV format and trigger download
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string = "export"
): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Create header row
  const headers = columns.map((col) => col.header);

  // Create data rows
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.accessorKey];
      // Handle different value types
      if (value === null || value === undefined) {
        return "";
      }
      if (typeof value === "string") {
        // Escape quotes and wrap in quotes if contains comma or newline
        const escaped = value.replace(/"/g, '""');
        if (escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')) {
          return `"${escaped}"`;
        }
        return escaped;
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return String(value);
    })
  );

  // Combine headers and rows
  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to JSON format and trigger download
 */
export function exportToJSON<T>(
  data: T[],
  filename: string = "export"
): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format data for clipboard copy (tab-separated for pasting into Excel)
 */
export function copyToClipboard<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[]
): Promise<void> {
  if (data.length === 0) {
    console.warn("No data to copy");
    return Promise.resolve();
  }

  const headers = columns.map((col) => col.header);
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.accessorKey];
      if (value === null || value === undefined) return "";
      return String(value);
    })
  );

  const content = [headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");

  return navigator.clipboard.writeText(content);
}
