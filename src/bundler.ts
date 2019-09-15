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
    const moduleCache = {};

    function require(id) {
      if (moduleCache[id]) return moduleCache[id];

      const [fn, mapping] = modules[id];

      function localRequire(relativePath) {
        return require(mapping[relativePath]);
      }

      const localModule = { exports: {} };
      moduleCache[id] = localModule.exports
      fn(localRequire, localModule, localModule.exports);
      return localModule.exports;
    }

    require(0);
  })({${modules}})`;
}
