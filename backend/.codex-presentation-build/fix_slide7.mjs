import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";

const projectDir = "C:/Users/deepa/OneDrive/Desktop/WPL_Mini_project/backend";
const runtimeNodeModules = "C:/Users/deepa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const skillDir = "C:/Users/deepa/.codex/plugins/cache/openai-primary-runtime/presentations/26.1020.11127/skills/presentations";
const inputPath = path.join(projectDir, "presentation-output/FoodBridge_WPL_Presentation_Updated.pptx");
const draftPath = path.join(projectDir, ".codex-presentation-build/draft-slide7-fixed.pptx");
const finalPath = path.join(projectDir, "presentation-output/FoodBridge_WPL_Presentation_Updated_Slide7_Fixed.pptx");
const receiptPath = path.join(projectDir, ".codex-presentation-build/FoodBridge_WPL_Presentation_Updated_Slide7_Fixed.validation.json");

process.env.RUNTIME_NODE_MODULES = runtimeNodeModules;
const require = createRequire(path.join(runtimeNodeModules, "__foodbridge_slide7__.cjs"));
const { FileBlob, PresentationFile } = require("@oai/artifact-tool");

for (const target of [draftPath, finalPath, receiptPath]) {
  try {
    await fs.access(target);
    throw new Error(`Refusing to overwrite existing file: ${target}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const presentation = await PresentationFile.importPptx(await FileBlob.load(inputPath));
if (presentation.slides.items.length !== 13) {
  throw new Error(`Expected 13 slides, found ${presentation.slides.items.length}`);
}
const slide = presentation.slides.items[6];
if (slide.id !== "gnmp4jqx") {
  throw new Error(`Slide 7 identity changed unexpectedly: ${slide.id}`);
}

const descriptions = [
  { id: "10", top: 198.72, text: "Business enters donor account" },
  { id: "14", top: 287.04, text: "Views active listings and impact" },
  { id: "18", top: 375.36, text: "Select item + quantity" },
  { id: "22", top: 463.68, text: "Choose start and end" },
  { id: "26", top: 552, text: "Listing becomes available" },
];

for (const item of descriptions) {
  const shape = slide.shapes.items.find(candidate => String(candidate.id) === item.id);
  if (!shape) throw new Error(`Could not find slide 7 description shape ${item.id}`);
  const actualText = shape.text?.toString?.() ?? "";
  if (!actualText.includes(item.text)) {
    throw new Error(`Unexpected text for shape ${item.id}: ${actualText}`);
  }
  shape.position = {
    ...shape.position,
    top: item.top + 38.4,
    height: 22,
  };
  shape.text.insets = { top: 0, right: 5.76, bottom: 0, left: 5.76 };
}

const draft = await PresentationFile.exportPptx(presentation);
await draft.save(draftPath);
console.log(`Draft saved: ${draftPath}`);

const { finalizePresentation } = await import(pathToFileURL(
  path.join(skillDir, "container_tools/artifact_tool_utils.mjs"),
).href);

const requirements = {
  explicitTotalSlideCount: 13,
  requiredNativeTableOwnerSlides: [11, 12],
  requiredNativeChartOwnerSlides: [],
};
const fontPolicy = {
  basis: "reference",
  families: ["Aptos", "Calibri"],
  referencePath: inputPath,
  referenceSha256: await sha256(inputPath),
};

async function sha256(filePath) {
  const { createHash } = await import("node:crypto");
  const hash = createHash("sha256");
  hash.update(await fs.readFile(filePath));
  return hash.digest("hex");
}

const fsConstants = await import("node:fs").then(module => module.constants);
const originalLink = fs.link;
// The environment blocks hard links; use an exclusive byte-for-byte copy for final placement.
fs.link = (from, to) => fs.copyFile(from, to, fsConstants.COPYFILE_EXCL);
let result;
try {
  result = await finalizePresentation({
    ...requirements,
    workspaceDir: projectDir,
    candidatePath: draftPath,
    finalPath,
    pythonExecutable: "C:/Users/deepa/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe",
    integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
    layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
    layoutArgs: [
      "--expected-slide-size-emu", "12192000,6858000",
      "--validate-bullet-geometry",
      "--validate-heading-fit",
      "--require-native-table-slide", "11",
      "--require-native-table-slide", "12",
    ],
    fontPolicy,
    verifyArtifactToolImport: true,
    receiptPath,
  });
} finally {
  fs.link = originalLink;
}

console.log(JSON.stringify({ finalPath, result }, null, 2));
