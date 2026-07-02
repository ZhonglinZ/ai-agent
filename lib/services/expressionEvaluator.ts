import { resolveVariables } from "./variableResolver";
import { Parser } from "expr-eval";
const parser = new Parser();

export function evaluateCondition(
  condition: string,
  variables: Record<string, unknown>,
): boolean {
  const expr = resolveVariables(condition, variables);
  if (!expr) return false;
  const containsMatch = expr.match(/^(.+?)\s+contains\s+(.+)$/i);
  if (containsMatch) {
    const left = containsMatch[1].trim().replace(/^["']|["']$/g, "");
    const right = containsMatch[2].trim().replace(/^["']|["']$/g, "");
    return left.includes(right);
  }

  // 字符串相等：a == b 或 a == "b"
  const eqMatch = expr.match(/^(.+?)\s*==\s*(.+)$/);
  if (eqMatch) {
    const left = eqMatch[1].trim().replace(/^["']|["']$/g, "");
    const right = eqMatch[2].trim().replace(/^["']|["']$/g, "");
    return left === right;
  }
  // 字符串不等
  const neqMatch = expr.match(/^(.+?)\s*!=\s*(.+)$/);
  if (neqMatch) {
    const left = neqMatch[1].trim().replace(/^["']|["']$/g, "");
    const right = neqMatch[2].trim().replace(/^["']|["']$/g, "");
    return left !== right;
  }

  // 数值比较：{{API.status_code}} > 200
  try {
    return Boolean(parser.evaluate(expr));
  } catch {
    return expr !== "false" && expr !== "0" && expr !== "";
  }
}
