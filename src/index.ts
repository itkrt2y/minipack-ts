import ts from "typescript";
import { createGraph } from "./graph";
import { bundle } from "./bundler";

const graph = createGraph("./examples/index.ts");
const result = bundle(graph);

ts.sys.writeFile("dist/bundled.js", result);
