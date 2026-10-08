import { jsonToTypeScript } from './converter';
import { jsonToZod } from './zodGenerator';

export type DiffType = 'missing' | 'extra' | 'type_mismatch' | 'null_mismatch';

export interface MissingDiff {
  path: string;
  type: 'missing';
  expected: string;
  message: string;
}

export interface ExtraDiff {
  path: string;
  type: 'extra';
  actual: string;
  message: string;
}

export interface TypeMismatchDiff {
  path: string;
  type: 'type_mismatch';
  expected: string;
  actual: string;
  message: string;
}

export interface NullMismatchDiff {
  path: string;
  type: 'null_mismatch';
  expected: string;
  actual: 'null';
  message: string;
}

export type Difference = MissingDiff | ExtraDiff | TypeMismatchDiff | NullMismatchDiff;

export type CompareResult =
  | { status: 'error'; error: string }
  | { status: 'success'; isValid: boolean; differences: Difference[]; expectedTs: string; expectedZod: string };

export const DIFF_LABELS: Record<DiffType, string> = {
  missing: 'Falta',
  extra: 'Sobra',
  type_mismatch: 'Tipo distinto',
  null_mismatch: 'Null inesperado',
};

function getKind(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function describeType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function compareNodes(
  expected: unknown,
  actual: unknown,
  path: string,
  differences: Difference[],
): void {
  if (expected === null && actual !== null) {
    differences.push({
      path,
      type: 'null_mismatch',
      expected: describeType(actual),
      actual: 'null',
      message: `Se esperaba null y se obtuvo ${describeType(actual)}`,
    });
    return;
  }

  if (expected !== null && actual === null) {
    differences.push({
      path,
      type: 'null_mismatch',
      expected: describeType(expected),
      actual: 'null',
      message: `Se esperaba ${describeType(expected)} y se obtuvo null`,
    });
    return;
  }

  if (expected === null && actual === null) {
    return;
  }

  const expectedKind = getKind(expected);
  const actualKind = getKind(actual);

  if (expectedKind !== actualKind) {
    differences.push({
      path,
      type: 'type_mismatch',
      expected: describeType(expected),
      actual: describeType(actual),
      message: `Se esperaba ${describeType(expected)} y se obtuvo ${describeType(actual)}`,
    });
    return;
  }

  if (expectedKind === 'array') {
    const expectedArr = expected as unknown[];
    const actualArr = actual as unknown[];
    const maxLen = Math.max(expectedArr.length, actualArr.length);

    for (let i = 0; i < maxLen; i++) {
      const elemPath = path ? `${path}[${i}]` : `[${i}]`;

      if (i >= expectedArr.length) {
        differences.push({
          path: elemPath,
          type: 'extra',
          actual: describeType(actualArr[i]),
          message: `Elemento extra en el índice ${i}`,
        });
      } else if (i >= actualArr.length) {
        differences.push({
          path: elemPath,
          type: 'missing',
          expected: describeType(expectedArr[i]),
          message: `Falta el elemento en el índice ${i}`,
        });
      } else {
        compareNodes(expectedArr[i], actualArr[i], elemPath, differences);
      }
    }
    return;
  }

  if (expectedKind === 'object') {
    const expectedObj = expected as Record<string, unknown>;
    const actualObj = actual as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(expectedObj), ...Object.keys(actualObj)]);

    for (const key of allKeys) {
      const keyPath = path ? `${path}.${key}` : key;

      if (!(key in expectedObj)) {
        differences.push({
          path: keyPath,
          type: 'extra',
          actual: describeType(actualObj[key]),
          message: `Campo inesperado "${key}"`,
        });
      } else if (!(key in actualObj)) {
        differences.push({
          path: keyPath,
          type: 'missing',
          expected: describeType(expectedObj[key]),
          message: `Falta el campo "${key}"`,
        });
      } else {
        compareNodes(expectedObj[key], actualObj[key], keyPath, differences);
      }
    }
  }
}

export function compareJson(expectedJson: string, actualJson: string): CompareResult {
  try {
    const expected = JSON.parse(expectedJson);
    const actual = JSON.parse(actualJson);

    const differences: Difference[] = [];
    compareNodes(expected, actual, '', differences);

    let expectedTs = '';
    let expectedZod = '';

    try {
      expectedTs = jsonToTypeScript(expectedJson, { rootName: 'Expected', outputMode: 'interface' });
    } catch {
      expectedTs = '';
    }

    try {
      expectedZod = jsonToZod(expectedJson, { rootName: 'Expected' });
    } catch {
      expectedZod = '';
    }

    return {
      status: 'success',
      isValid: differences.length === 0,
      differences,
      expectedTs,
      expectedZod,
    };
  } catch (e) {
    return {
      status: 'error',
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
