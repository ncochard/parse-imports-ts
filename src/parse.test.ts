import { parse } from './parse';
import { ImportedPackageType } from './types';

describe('parse', () => {
  it('detect nothing for empty string', () => {
    expect(parse('')).toEqual([]);
  });
  it('detect default imports', () => {
    const input = 'import _ from "lodash";';
    const expected = [
      { name: 'lodash', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input)).toEqual(expected);
  });
  it('detect polyfill imports', () => {
    const input = "import 'core-js'";
    const expected = [
      { name: 'core-js', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input)).toEqual(expected);
  });
  it('detect deep polyfill imports', () => {
    const input = "import 'core-js/actual/array/from'";
    const expected = [
      { name: 'core-js', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input)).toEqual(expected);
  });
  it('detect multiple imports', () => {
    const input = [
      "import array from 'lodash/array';",
      'import map from "lodash/map";',
    ];
    const expected = [
      { name: 'lodash', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input.join(';'))).toEqual(expected);
  });
  it('detect non default imports', () => {
    const input = [
      "import {array} from 'lodash';",
      'import {map} from "lodash";',
      'import {xx} from "./my-module";',
    ];
    const expected = [
      { name: 'lodash', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input.join(';'))).toEqual(expected);
  });
  it('detect type imports', () => {
    const input = [
      "import type { SomeType } from 'some-package';",
      "import type { SomeOtherType } from 'some-package';",
      "import type { InternalType } from './some-module';",
    ];
    const expected = [
      { name: 'some-package', type: ImportedPackageType.TypeImport },
    ];
    expect(parse(input.join('\n'))).toEqual(expected);
  });
  it('detect exported default imports', () => {
    const input = [
      "export { array } from 'lodash';",
      'export function blah() {}',
    ];
    const expected = [
      { name: 'lodash', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input.join(';'))).toEqual(expected);
  });
  it('detect dynamic imports', () => {
    const input = `import("some-package1");
    export function example() {
      return import("some-package2");
    }
    `;
    const expected = [
      { name: 'some-package1', type: ImportedPackageType.NormalImport },
      { name: 'some-package2', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input)).toEqual(expected);
  });
  it('detect simple require function', () => {
    const input = 'require("some-package1");';
    const expected = [
      { name: 'some-package1', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input)).toEqual(expected);
  });
  it('detect require function', () => {
    const input = `
    const x = require("some-package1");
    const {y} = require("some-package2");
    require("some-package3");
    export function example() {
      return require("some-package4");
    }
    `;
    const expected = [
      { name: 'some-package1', type: ImportedPackageType.NormalImport },
      { name: 'some-package2', type: ImportedPackageType.NormalImport },
      { name: 'some-package3', type: ImportedPackageType.NormalImport },
      { name: 'some-package4', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input)).toEqual(expected);
  });
});
