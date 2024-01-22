import { parse } from './parse';
import { ImportedPackageType } from './types';

describe('parse', () => {
  it('detect type with an alias', () => {
    const input = [
      "import { type AAA as XXX } from 'some-package-1';",
      "import { type BBB as YYY, type CCC } from 'some-package-2';",
      "import { DDD } from 'some-package-3';",
    ];
    const expected = [
      { name: 'some-package-1', type: ImportedPackageType.TypeImport },
      { name: 'some-package-2', type: ImportedPackageType.TypeImport },
      { name: 'some-package-3', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input.join('\n'))).toEqual(expected);
  });
  it('detect mixed type and non-type imports', () => {
    const input = [
      "import { type Type0 } from 'some-package';",
      "import { Object4  } from 'some-package';",
    ];
    const expected = [
      { name: 'some-package', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input.join('\n'))).toEqual(expected);
  });
  it('detect nested type imports', () => {
    const input = [
      "import { type Type0 } from 'some-package';",
      "import { type Type1, type Type2  } from 'some-other-package';",
      "import { type Type3, Object4  } from 'some-non-type-package';",
    ];
    const expected = [
      { name: 'some-package', type: ImportedPackageType.TypeImport },
      { name: 'some-other-package', type: ImportedPackageType.TypeImport },
      { name: 'some-non-type-package', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input.join('\n'))).toEqual(expected);
  });
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
  it('detect require function inside a function', () => {
    const input = `
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.warn = exports.error = exports.debug = void 0;
    var chalk_1 = __importDefault(require("chalk"));
    `;
    const expected = [
      { name: 'chalk', type: ImportedPackageType.NormalImport },
    ];
    expect(parse(input)).toEqual(expected);
  });
});
