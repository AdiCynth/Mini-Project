import path from "node:path";
import { createRequire } from "node:module";
import fs from "node:fs/promises";

const projectDir = "C:/Users/deepa/OneDrive/Desktop/WPL_Mini_project/backend";
const runtimeNodeModules = "C:/Users/deepa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
process.env.RUNTIME_NODE_MODULES = runtimeNodeModules;
const require = createRequire(path.join(runtimeNodeModules, "__foodbridge_cover__.cjs"));
const { FileBlob, PresentationFile } = require("@oai/artifact-tool");

const inputPath = path.join(projectDir, "presentation-output/FoodBridge_WPL_Presentation_Updated_Slide7_Fixed.pptx");
const previewPath = path.join(projectDir, ".codex-presentation-build/cover-before.png");
const presentation = await PresentationFile.importPptx(await FileBlob.load(inputPath));
const slide = presentation.slides.items[0];
const shapes = slide.shapes.items.map(shape => ({
  id: shape.id,
  name: shape.name,
  position: shape.position,
  text: shape.text?.toString?.() ?? "",
  style: shape.text?.style,
}));
console.log(JSON.stringify({ slideId: slide.id, shapes }, null, 2));
const detail = await presentation.inspect({
  select: "$.slides[0].elements[?(@.text)]",
  include: ["id", "text", "position", "style", "paragraphs"],
});
console.log(`INSPECT\n${detail.ndjson}`);
const preview = await presentation.export({ slide, format: "png", scale: 1 });
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
console.log(`Preview saved: ${previewPath}`);
