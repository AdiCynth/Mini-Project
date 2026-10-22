import path from "node:path";
import { createRequire } from "node:module";
import fs from "node:fs/promises";

const projectDir = "C:/Users/deepa/OneDrive/Desktop/WPL_Mini_project/backend";
const runtimeNodeModules = "C:/Users/deepa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
process.env.RUNTIME_NODE_MODULES = runtimeNodeModules;
const require = createRequire(path.join(runtimeNodeModules, "__foodbridge_cover_edit__.cjs"));
const { FileBlob, PresentationFile } = require("@oai/artifact-tool");

const inputPath = path.join(projectDir, "presentation-output/FoodBridge_WPL_Presentation_Updated_Slide7_Fixed.pptx");
const draftPath = path.join(projectDir, ".codex-presentation-build/draft-cover-authors-v2.pptx");
const previewPath = path.join(projectDir, ".codex-presentation-build/cover-authors-after-v2.png");
const layoutPath = path.join(projectDir, ".codex-presentation-build/cover-authors-after-v2.layout.json");

for (const outputPath of [draftPath, previewPath, layoutPath]) {
  try {
    await fs.access(outputPath);
    throw new Error(`Refusing to overwrite existing file: ${outputPath}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const presentation = await PresentationFile.importPptx(await FileBlob.load(inputPath));
if (presentation.slides.items.length !== 13) throw new Error("Expected the existing 13-slide deck.");
const target = presentation.resolve("sh/utg3698n");
if (!target.text.toString().includes("Prepared by: Aditya Chaugala")) {
  throw new Error(`Unexpected cover credit: ${target.text.toString()}`);
}

target.text = [
  "Prepared by:",
  "16014024010 : Aarya Chandra",
  "16014024011 : Rudra Chaplot",
  "16014024012 : Aditya Chaugala",
].join("\n");
target.text.style = {
  fontSize: 18.67,
  typeface: "Aptos",
  color: "#585858",
  alignment: "center",
  verticalAlignment: "top",
  bold: false,
  wrap: "none",
  autoFit: "none",
  insets: { top: 5.76, right: 5.76, bottom: 5.76, left: 5.76 },
};
target.position = {
  ...target.position,
  left: 153.6,
  top: 385.92,
  width: 844.8,
  height: 110.4,
};

const preview = await presentation.export({ slide: presentation.slides.items[0], format: "png", scale: 1 });
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
const layout = await presentation.slides.items[0].export({ format: "layout", detail: "full" });
await fs.writeFile(layoutPath, await layout.text(), "utf8");
await (await PresentationFile.exportPptx(presentation)).save(draftPath);

const verification = await presentation.inspect({
  select: "$.slides[0].elements[?(@.text)]",
  include: ["id", "text", "position", "style", "paragraphs"],
});
console.log(JSON.stringify({ draftPath, previewPath, verification: verification.ndjson }, null, 2));
