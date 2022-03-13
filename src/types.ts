export enum ImportedPackageType {
  NormalImport,
  TypeImport,
}

export type ImportedPackage = {
  name: string;
  type: ImportedPackageType;
};
