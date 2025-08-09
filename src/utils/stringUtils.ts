export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  
  // Try to cut at word boundary
  const truncated = str.substring(0, length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace === -1) return truncated + '...';
  return truncated.substring(0, lastSpace) + '...';
}