export function getPackageName(name: string): string | undefined {
  const parts = name.split(/\/|\\/).filter((p) => p?.length > 0);
  if (parts.length === 0) {
    throw new Error(`Invalid package: ${name}`);
  }
  if (['.', '..'].includes(parts[0])) {
    return undefined;
  }
  if (parts.length === 1) {
    return parts[0];
  }
  if (parts.length > 1) {
    if (parts[0].startsWith('@')) {
      return `${parts[0]}/${parts[1]}`;
    }
    return parts[0];
  }
  throw new Error(`Invalid package: ${name}`);
}
