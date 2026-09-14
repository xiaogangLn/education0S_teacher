export function extractPayload<T = any>(response: any): T {
  return (response?.data ?? response) as T;
}

export function asList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  return payload?.items || payload?.data || [];
}

export async function downloadAuthedFile(url: string, filename: string) {
  const token = localStorage.getItem('accessToken') || '';
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('下载失败');
  const blob = await response.blob();
  const href = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(href);
}

export function formatDate(value?: string) {
  if (!value) return '';
  return String(value).slice(0, 10);
}
