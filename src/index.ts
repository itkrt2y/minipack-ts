import ts from "typescript";
import { createGraph } from "./graph";
import { bundle } from "./bundler";

const filename = process.argv[2];
if (!filename) throw new Error("No filename provided");

const graph = createGraph(filename);
const result = bundle(graph);

ts.sys.writeFile("dist/bundled.js", result);
