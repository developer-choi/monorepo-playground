export function joinUrl(prefixUrl: string, path: string): string {
  if (!prefixUrl) {
    return path;
  }

  return `${prefixUrl.replace(/\/+$/, '')}/${stripLeadingSlash(path)}`;
}

function stripLeadingSlash(path: string): string {
  return path.replace(/^\/+/, '');
}
