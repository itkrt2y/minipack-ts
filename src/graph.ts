import * as path from "path";
import { Asset, createAsset } from "./asset";

export type Graph = Asset[];

export function createGraph(entryFilename: string): Graph {
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
