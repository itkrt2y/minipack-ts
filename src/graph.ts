import * as ts from "typescript";
import * as path from "path";
import { Asset, createAsset } from "./asset";

export type Graph = Asset[];

export function createGraph(entryFilename: string): Graph {
  const mainAsset = createAsset(resolvePath(entryFilename));
  const queue = [mainAsset];

  for (const asset of queue) {
    const dirname = path.dirname(asset.filename);

    asset.dependencies.forEach(relativePathOrNodeModule => {
      const absolutePath = resolvePath(relativePathOrNodeModule, dirname);

      let child = queue.find(asset => asset.filename === absolutePath);
      if (!child) {
        child = createAsset(absolutePath);
        queue.push(child);
      }

      asset.mapping[relativePathOrNodeModule] = child.id;
    });
  }

  return queue;
}

function resolvePath(
  filename: string,
  dirname: string = "",
  extensions: string[] = [".ts"]
): string {
  if (filename.startsWith("./")) {
    let filePath = path.resolve(dirname, filename);
    if (ts.sys.fileExists(filePath)) return filePath;

    extensions.forEach(ext => {
      let p = filePath + ext;
      if (ts.sys.fileExists(p)) {
        filePath = p;
        return;
      }

      p = path.join(filePath, "index" + ext);
      if (ts.sys.fileExists(p)) {
        filePath = p;
        return;
      }
    });

    return filePath; // local file path
  } else {
    return require.resolve(filename); // node module path
  }
}
