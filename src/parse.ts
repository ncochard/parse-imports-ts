/* eslint-disable @typescript-eslint/no-use-before-define */
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
  const children: ts.Node[] = [];
  ts.forEachChild(importDeclaration, (child: ts.Node) => {
    children.push(child);
  });
  if (children.length === 2) {
    if (ts.isImportClause(children[0]) && ts.isStringLiteral(children[1])) {
      result.push({
        name: getPackageName(children[1].text),
        type: ImportedPackageType.NormalImport,
      });
    } else {
      children.forEach((child) => result.push(...parseTsNode(child)));
    }
  } else {
    children.forEach((child) => result.push(...parseTsNode(child)));
  }
  return result;
}

function parseTsCallExpression(callExpression: ts.Node): ImportedPackage[] {
  const type = ImportedPackageType.NormalImport;
  const result: ImportedPackage[] = [];
  const isDynamicImport = (child: ts.Node) => child.kind === ts.SyntaxKind.ImportKeyword;
  const isRequire = (child: ts.Node) => ts.isIdentifier(child) && child.getText() === 'require';
  const isImport = (child: ts.Node) => isDynamicImport(child) || isRequire(child);
  const children: ts.Node[] = [];
  ts.forEachChild(callExpression, (child: ts.Node) => {
    children.push(child);
  });
  if (children.length === 2) {
    if (isImport(children[0]) && ts.isStringLiteral(children[1])) {
      result.push({
        name: getPackageName(children[1].text),
        type,
      });
    } else {
      children.forEach((child) => result.push(...parseTsNode(child)));
    }
  } else {
    children.forEach((child) => result.push(...parseTsNode(child)));
  }
  return result;
}

function parseTsNode(node: ts.Node): ImportedPackage[] {
  const result: ImportedPackage[] = [];
  if (ts.isExportDeclaration(node)) {
    result.push(...parseTsExportDeclaration(node));
  } else if (ts.isImportDeclaration(node)) {
    result.push(...parseTsImportDeclaration(node));
  } else if (ts.isImportEqualsDeclaration(node)) {
    result.push(...parseTsEqualsDeclaration(node));
  } else if (ts.isCallExpression(node)) {
    result.push(...parseTsCallExpression(node));
  } else {
    ts.forEachChild(node, (child: ts.Node) => {
      result.push(...parseTsNode(child));
    });
  }
  return result;
}

function parseTsSourceFile(node: ts.Node): ImportedPackage[] {
  const result: ImportedPackage[] = [];
  ts.forEachChild(node, (child: ts.Node) => {
    result.push(...parseTsNode(child));
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
