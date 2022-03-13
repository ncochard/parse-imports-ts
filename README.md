# Identifies the packages imported form a TypeScript file

## Detects top level imports

    import { parse } from "parse-imports-ts";

    const input = `
        import "import _ from "lodash";"
        import 'core-js';
    `;
    const output = parse(input);
    console.log(JSON.stringify(output));
    //[
    //  { name: "lodash", type: 0},
    //  { name: "core-js", type: 0}
    //]

## Detects dynamic imports

    import { parse } from "parse-imports-ts";

    const input = `
        export function myFunction() {
            return import("my-package");
        }
    `;
    const output = parse(input);
    console.log(JSON.stringify(output));
    //[
    //  { name: "my-package", type: 0}
    //]

## Detects type imports

    import { parse } from "parse-imports-ts";

    const input = `
        import type { MyType } from "my-pacakge";
    `;
    const output = parse(input);
    console.log(JSON.stringify(output));
    //[
    //  { name: "my-package", type: 1}
    //]