import ts from 'typescript';
import { ImportedPackage, ImportedPackageType } from './types';
import { getPackageName } from './get-package-name';
import { dedupe } from './dedupe';

function parseTsExportDeclaration(
  exportDeclaration: ts.Node,
): ImportedPackage[] {
  const result: ImportedPackage[] = [];
  const type = ImportedPackageType.NormalImport;
  ts.forEachChild(exportDeclaration, (child: ts.Node) => {
    if (ts.isStringLiteral(child)) {
      const name = child.text;
      result.push({
        name: getPackageName(name),
        type,
      });
    }
  });
  return result;
}

function parseTsImportDeclaration(
  importDeclaration: ts.Node,
): ImportedPackage[] {
  const result: ImportedPackage[] = [];
  let type = ImportedPackageType.NormalImport;
  ts.forEachChild(importDeclaration, (child: ts.Node) => {
    if (ts.isImportClause(child)) {
      if (ts.isTypeOnlyImportOrExportDeclaration(child)) {
        type = ImportedPackageType.TypeImport;
      }
    }
    if (ts.isStringLiteral(child)) {
      const name = child.text;
      result.push({
        name: getPackageName(name),
        type,
      });
    }
  });
  return result;
}

function parseTsEqualsDeclaration(
  importDeclaration: ts.Node,
): ImportedPackage[] {
  const result: ImportedPackage[] = [];
  let index = 0;
  ts.forEachChild(importDeclaration, (child: ts.Node) => {
    if (index === 0 && !ts.isImportClause(child)) {
      return;
    }
    const type = ImportedPackageType.NormalImport;
    if (index === 1 && ts.isStringLiteral(child)) {
      result.push({
        name: getPackageName(child.text),
        type,
      });
    }
    index += 1;
  });
  return result;
}

function parseTsCallExpression(callExpression: ts.Node): ImportedPackage[] {
  const type = ImportedPackageType.NormalImport;
  const result: ImportedPackage[] = [];
  let index = 0;
  const isDynamicImport = (child: ts.Node) => child.kind === ts.SyntaxKind.ImportKeyword;
  const isRequire = (child: ts.Node) => ts.isIdentifier(child) && child.getText() === 'require';
  const isImport = (child: ts.Node) => isDynamicImport(child) || isRequire(child);
  ts.forEachChild(callExpression, (child: ts.Node) => {
    if (index === 0 && !isImport(child)) {
      return;
    }
    if (index === 1 && ts.isStringLiteral(child)) {
      result.push({
        name: getPackageName(child.text),
        type,
      });
    }
    index += 1;
  });
  return result;
}

function parseTsSourceFile(node: ts.Node): ImportedPackage[] {
  const result: ImportedPackage[] = [];
  ts.forEachChild(node, (child: ts.Node) => {
    if (ts.isExportDeclaration(child)) {
      result.push(...parseTsExportDeclaration(child));
    } else if (ts.isImportDeclaration(child)) {
      result.push(...parseTsImportDeclaration(child));
    } else if (ts.isImportEqualsDeclaration(child)) {
      result.push(...parseTsEqualsDeclaration(child));
    } else if (ts.isCallExpression(child)) {
      result.push(...parseTsCallExpression(child));
    } else {
      result.push(...parseTsSourceFile(child));
    }
  });
  return result;
}

export function parse(code: string, file = 'file.ts'): ImportedPackage[] {
  const sc = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
  if (ts.isSourceFile(sc)) {
    return dedupe(parseTsSourceFile(sc));
  }
  return [];
}
