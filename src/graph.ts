import * as path from "path";
import { Asset, createAsset } from "./asset";

export type Graph = Asset[];

export function createGraph(entryFilename: string): Graph {
  const mainAsset = createAsset(entryFilename);
  const queue = [mainAsset];

  for (const asset of queue) {
    const dirname = path.dirname(asset.filename);

    asset.dependencies.forEach(relativePathOrNodeModule => {
      const child = createAsset(resolvePath(relativePathOrNodeModule, dirname));

      asset.mapping[relativePathOrNodeModule] = child.id;
      queue.push(child);
    });
  }

  return queue;
}

function resolvePath(filename: string, dirname: string): string {
  return filename.startsWith("./")
    ? path.resolve(dirname, filename)
    : require.resolve(filename);
}
