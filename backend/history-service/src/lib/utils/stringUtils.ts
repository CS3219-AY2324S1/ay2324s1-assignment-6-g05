export function isPrismaCuid(id: string) {
  return /^cl[0-9a-z]{23}$/.test(id);
}
