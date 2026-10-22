import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";

const projectDir = "C:/Users/deepa/OneDrive/Desktop/WPL_Mini_project/backend";
const runtimeNodeModules = "C:/Users/deepa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const skillDir = "C:/Users/deepa/.codex/plugins/cache/openai-primary-runtime/presentations/26.1020.11127/skills/presentations";
const candidatePath = path.join(projectDir, ".codex-presentation-build/draft-cover-authors-v2.pptx");
const referencePath = path.join(projectDir, "presentation-output/FoodBridge_WPL_Presentation_Updated_Slide7_Fixed.pptx");
const finalPath = path.join(projectDir, "presentation-output/FoodBridge_WPL_Presentation_Updated_Slide7_Fixed_Authors.pptx");
const receiptPath = path.join(projectDir, ".codex-presentation-build/FoodBridge_WPL_Presentation_Updated_Slide7_Fixed_Authors.validation.json");

for (const outputPath of [finalPath, receiptPath]) {
  try {
    await fs.access(outputPath);
    throw new Error(`Refusing to overwrite existing file: ${outputPath}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function sha256(filePath) {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(await fs.readFile(filePath)).digest("hex");
}

process.env.RUNTIME_NODE_MODULES = runtimeNodeModules;
const require = createRequire(path.join(runtimeNodeModules, "__foodbridge_finalizer__.cjs"));
const { finalizePresentation } = await import(pathToFileURL(
  path.join(skillDir, "container_tools/artifact_tool_utils.mjs"),
).href);

const fsConstants = await import("node:fs").then(module => module.constants);
const originalLink = fs.link;
// The environment blocks hard links; use an exclusive byte-for-byte copy for final placement.
fs.link = (from, to) => fs.copyFile(from, to, fsConstants.COPYFILE_EXCL);
let result;
try {
  result = await finalizePresentation({
    explicitTotalSlideCount: 13,
    requiredNativeTableOwnerSlides: [11, 12],
    requiredNativeChartOwnerSlides: [],
    workspaceDir: projectDir,
    candidatePath,
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
    fontPolicy: {
      basis: "reference",
      families: ["Aptos", "Calibri"],
      referencePath,
      referenceSha256: await sha256(referencePath),
    },
    verifyArtifactToolImport: true,
    receiptPath,
  });
} finally {
  fs.link = originalLink;
}

console.log(JSON.stringify({ finalPath, result }, null, 2));
