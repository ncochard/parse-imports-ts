import { ImportedPackage, ImportedPackageType } from './types';

type ImportedPackageMap = { [name: string]: ImportedPackageType };

function toMap(input: ImportedPackage[]): ImportedPackageMap {
  return input.reduce(
    (agg: ImportedPackageMap, current: ImportedPackage): ImportedPackageMap => {
      if (!current?.name?.length) {
        return agg;
      }
      const names = Object.keys(agg);
      let type: ImportedPackageType;
      if (names.includes(current.name)) {
        type = agg[current.name] === ImportedPackageType.NormalImport
          ? ImportedPackageType.NormalImport
          : current.type;
      } else {
        type = current.type;
      }
      return { ...agg, [current.name]: type };
    },
    {} as ImportedPackageMap,
  );
}

function toArray(input: ImportedPackageMap): ImportedPackage[] {
  return Object.keys(input).reduce(
    (agg: ImportedPackage[], name: string): ImportedPackage[] => {
      const type = input[name];
      return [...agg, { name, type }];
    },
    [] as ImportedPackage[],
  );
}

export function dedupe(input: ImportedPackage[]): ImportedPackage[] {
  const map = toMap(input);
  const arr = toArray(map);
  return arr;
}
