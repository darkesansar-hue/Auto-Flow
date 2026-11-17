/**
 * Safe expression evaluator for FlowForge.
 * Strictly parses `{{ $json.key }}` or `{{ $node["NodeName"].json.key }}`.
 * NEVER uses `eval()` or `new Function()`.
 */

export function resolveValue(
  template: any,
  currentJson: any,
  allNodesOutput: Record<string, any> = {}
): any {
  if (typeof template !== 'string') {
    return template;
  }

  // Exact single expression match: return raw typed value (e.g. number, boolean, object)
  const singleMatch = template.trim().match(/^\{\{\s*(.*?)\s*\}\}$/);
  if (singleMatch) {
    return evaluateExpression(singleMatch[1], currentJson, allNodesOutput);
  }

  // String interpolation for multiple tokens e.g. "https://api.example.com/items/{{$json.id}}"
  return template.replace(/\{\{\s*(.*?)\s*\}\}/g, (_, expr) => {
    const val = evaluateExpression(expr, currentJson, allNodesOutput);
    return val !== undefined && val !== null ? String(val) : '';
  });
}

function evaluateExpression(
  expr: string,
  currentJson: any,
  allNodesOutput: Record<string, any>
): any {
  const trimmed = expr.trim();

  // Pattern 1: $json.foo.bar
  if (trimmed.startsWith('$json')) {
    const path = trimmed.replace(/^\$json\.?/, '');
    if (!path) return currentJson;
    return getByPath(currentJson, path);
  }

  // Pattern 2: $node["NodeName"].json.foo.bar or $node['NodeName'].json.foo.bar
  const nodeMatch = trimmed.match(/^\$node\[['"](.*?)['"]\]\.?(.*)$/);
  if (nodeMatch) {
    const nodeNameOrId = nodeMatch[1];
    const subPath = nodeMatch[2]; // e.g. "json.data.user"
    const nodeOut = allNodesOutput[nodeNameOrId];
    if (!nodeOut) return undefined;
    
    if (subPath.startsWith('json')) {
      const jsonPath = subPath.replace(/^json\.?/, '');
      return jsonPath ? getByPath(nodeOut.json, jsonPath) : nodeOut.json;
    }
    return getByPath(nodeOut, subPath);
  }

  // Fallback direct path on currentJson
  return getByPath(currentJson, trimmed);
}

function getByPath(obj: any, path: string): any {
  if (obj === undefined || obj === null) return undefined;
  if (!path) return obj;

  const parts = path.split('.').filter(Boolean);
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}
