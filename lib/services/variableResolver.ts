export function resolveVariables(
  template: string,
  variables: Record<string, unknown>,
): string {
  if (!template) return "";

  return template.replace(/\{\{([^}]+)\}\}/g, (match, varPath) => {
    const value = variables[varPath.trim()];
    if (value === undefined) return match;
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  });
}
