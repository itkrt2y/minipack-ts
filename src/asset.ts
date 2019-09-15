import ts from "typescript";

let id = 0;

export type Asset = {
  id: number;
  filename: string;
  code: string;
  dependencies: string[];
  mapping: {
    [path: string]: number;
  };
};

export function createAsset(filename: string): Asset {
  const content = ts.sys.readFile(filename);
  if (!content) throw new Error(`${filename} does not exist`);

  const source = ts.createSourceFile(
    filename,
    content,
    ts.ScriptTarget.ESNext,
    true
  );

  const dependencies: string[] = [];

  source.forEachChild(node => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      dependencies.push(node.moduleSpecifier.text);
    }
  });

  const code = ts.transpileModule(content, {
    compilerOptions: {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      noImplicitUseStrict: true
    }
  }).outputText;

  return {
    id: id++,
    filename,
    code,
    dependencies,
    mapping: {}
  };
}
