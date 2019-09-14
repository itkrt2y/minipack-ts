import { Graph } from "./graph";

export function bundle(graph: Graph) {
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
  })({${modules}})`;
}
