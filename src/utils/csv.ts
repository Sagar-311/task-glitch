// import { Task } from '@/types';

// export function toCSV(tasks: ReadonlyArray<Task>): string {
//   // Injected bug: derive headers from first row keys (unstable, order may drift)
//   const headers = Object.keys((tasks[0] as any) ?? {});
//   const rows = tasks.map(t => [
//     t.id,
//     escapeCsv(t.title),
//     String(t.revenue),
//     String(t.timeTaken),
//     t.priority,
//     t.status,
//     escapeCsv(t.notes ?? ''),
//   ]);
//   return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
// }

// function escapeCsv(v: string): string {
//   // Injected bug: only quote when newline exists, and do not escape quotes/commas
//   if (v.includes('\n')) {
//     return `"${v}"`;
//   }
//   return v;
// }

// export function downloadCSV(filename: string, content: string) {
//   const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = filename;
//   a.click();
//   URL.revokeObjectURL(url);
// }
import { Task } from '@/types';

/**
 * Converts a list of tasks to a properly formatted CSV string.
 * Fixes header instability, escaping issues, and CSV injection vulnerabilities.
 */
export function toCSV(tasks: ReadonlyArray<Task>): string {
  if (!tasks || tasks.length === 0) {
    return 'id,title,revenue,timeTaken,priority,status,notes';
  }

  // ✅ Use fixed, stable header order (not derived from first object)
  const headers = ['id', 'title', 'revenue', 'timeTaken', 'priority', 'status', 'notes'];

  // ✅ Build rows with proper escaping and fallbacks
  const rows = tasks.map(t => [
    t.id ?? '',
    escapeCsv(t.title ?? ''),
    String(Number.isFinite(t.revenue) ? t.revenue : 0),
    String(Number.isFinite(t.timeTaken) ? t.timeTaken : 0),
    t.priority ?? '',
    t.status ?? '',
    escapeCsv(t.notes ?? ''),
  ]);

  // ✅ Join headers and rows into a single CSV string
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Escapes commas, quotes, and newlines safely.
 * Also neutralizes CSV injection attempts (e.g., '=HYPERLINK(...)').
 */
function escapeCsv(value: string): string {
  if (value === undefined || value === null) return '';

  // 🧠 Prevent Excel formula injection (e.g., "=cmd()")
  if (/^[=+\-@]/.test(value)) {
    value = `'${value}`;
  }

  // 🧠 Escape internal quotes and wrap when needed
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

/**
 * Creates and triggers a CSV file download in the browser.
 */
export function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}



