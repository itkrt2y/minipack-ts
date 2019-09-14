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
  const content = readFile(filename, [".ts"]);

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

function readFile(filename: string, extensions: string[]): string {
  const content = ts.sys.readFile(filename);
  if (content) return content;

  const ext = extensions.find(ext => ts.sys.fileExists(filename + ext));
  if (ext) return ts.sys.readFile(filename + ext)!;

  throw new Error(`${filename} does not exist`);
}
