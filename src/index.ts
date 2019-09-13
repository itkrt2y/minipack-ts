import ts from "typescript";
import * as path from "path";

type Asset = {
  id: number;
  filename: string;
  code: string;
  dependencies: string[];
  mapping: {
    [path: string]: number;
  };
};

let id = 0;

function createAsset(filename: string): Asset {
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

type Graph = Asset[];

function createGraph(entryFilename: string): Graph {
  const mainAsset = createAsset(entryFilename);
  const queue = [mainAsset];

  for (const asset of queue) {
    const dirname = path.dirname(asset.filename);

    asset.dependencies.forEach(relativePath => {
      const absolutePath = path.join(dirname, relativePath);
      const child = createAsset(absolutePath);

      asset.mapping[relativePath] = child.id;
      queue.push(child);
    });
  }

  return queue;
}

function bundle(graph: Graph) {
  let modules = ``;

  graph.forEach(asset => {
    modules += `${asset.id}: [
      function (require, module, exports) { ${asset.code} },
      ${JSON.stringify(asset.mapping)}
    ],`;
  });

  return `
  (function (modules) {
    function require(id) {
      const [fn, mapping] = modules[id];

      function localRequire(relativePath) {
        return require(mapping[relativePath]);
      }

      const localModule = { exports: {} };

      fn(localRequire, localModule, localModule.exports);

      return localModule.exports;
    }

    require(0);
  })({${modules}})
  `;
}

function readFile(filename: string, extensions: string[]): string {
  const content = ts.sys.readFile(filename);
  if (content) return content;

  const ext = extensions.find(ext => ts.sys.fileExists(filename + ext));
  if (ext) return ts.sys.readFile(filename + ext)!;

  throw new Error(`${filename} does not exist`);
}

const graph = createGraph("./examples/index.ts");
const result = bundle(graph);
ts.sys.writeFile("dist/bundled.js", result);
