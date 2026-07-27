export function getMonogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";

  if (parts.length === 1) return (parts.at(0) ?? "").slice(0, 2).toUpperCase();
  
  return `${parts.at(0)?.at(0) ?? ""}${parts.at(1)?.at(0) ?? ""}`.toUpperCase();
}
