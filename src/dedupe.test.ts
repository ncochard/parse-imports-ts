import { dedupe } from './dedupe';
import { ImportedPackageType } from './types';

describe('dedupe', () => {
  it('empty', () => {
    expect(dedupe([])).toEqual([]);
  });
  it('dedupes single item', () => {
    expect(
      dedupe([{ name: 'my-package', type: ImportedPackageType.NormalImport }]),
    ).toEqual([{ name: 'my-package', type: ImportedPackageType.NormalImport }]);
  });
  it('dedupes multiple items', () => {
    expect(
      dedupe([
        { name: 'my-package', type: ImportedPackageType.NormalImport },
        { name: 'my-package', type: ImportedPackageType.NormalImport },
      ]),
    ).toEqual([{ name: 'my-package', type: ImportedPackageType.NormalImport }]);
  });
  it('dedupes multiple items of separate types', () => {
    expect(
      dedupe([
        { name: 'my-package1', type: ImportedPackageType.NormalImport },
        { name: 'my-package2', type: ImportedPackageType.NormalImport },
        { name: 'my-package2', type: ImportedPackageType.TypeImport },
      ]),
    ).toEqual([
      { name: 'my-package1', type: ImportedPackageType.NormalImport },
      { name: 'my-package2', type: ImportedPackageType.NormalImport },
    ]);
  });
  it('dedupes multiple type imports', () => {
    expect(
      dedupe([
        { name: 'my-package1', type: ImportedPackageType.NormalImport },
        { name: 'my-package2', type: ImportedPackageType.TypeImport },
        { name: 'my-package2', type: ImportedPackageType.TypeImport },
      ]),
    ).toEqual([
      { name: 'my-package1', type: ImportedPackageType.NormalImport },
      { name: 'my-package2', type: ImportedPackageType.TypeImport },
    ]);
  });
});
