export function artifactKindLabel(kind?: string) {
  const token = String(kind || '');
  if (/exam|试卷/.test(token)) return '试卷';
  if (/courseware|课件/.test(token)) return '课件';
  if (/research|查资料/.test(token)) return '';
  if (/review|复习/.test(token)) return '复习课';
  return '教案';
}

export function artifactDisplayName(name?: string, kind?: string) {
  const label = artifactKindLabel(kind);
  const raw = String(name || '').trim();
  if (!label) return raw || '未命名';
  const base = raw.replace(/(教案|课件|试卷|复习课)+$/g, '').trim() || '未命名课题';
  return `${base}${label}`;
}
