import { register } from "node:module";
import { pathToFileURL } from "node:url";
import "ts-node/esm"; // Import ts-node/esm directly

register("ts-node/esm", pathToFileURL("./"));
