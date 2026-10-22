import crypto from "node:crypto";
import fs from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const projectDir = process.cwd();
const sourcePath = path.resolve(projectDir, "..", "FoodBridge_WPL_Presentation.pptx");
const buildDir = path.join(projectDir, ".codex-presentation-build");
const stageDir = path.join(buildDir, ".codex-finalizer");
const finalPath = path.join(projectDir, "presentation-output", "FoodBridge_WPL_Presentation_Updated.pptx");
const skillDir = "C:/Users/deepa/.codex/plugins/cache/openai-primary-runtime/presentations/26.1020.11127/skills/presentations";
const runtimeNodeModules = "C:/Users/deepa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const runtimePython = "C:/Users/deepa/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
process.env.RUNTIME_NODE_MODULES = runtimeNodeModules;

const require = createRequire(path.join(runtimeNodeModules, "__foodbridge_pptx_authoring__.cjs"));
const { FileBlob, PresentationFile } = require("@oai/artifact-tool");

function textShape(slide, expectedText) {
  const shape = slide.shapes.items.find(item => String(item.text ?? "").trim() === expectedText);
  if (!shape) throw new Error(`Could not find text shape: ${expectedText}`);
  return shape;
}

function writeTable(table, rows) {
  if (table.rowCount !== rows.length || table.columnCount !== rows[0].length) {
    throw new Error(`Expected ${rows.length}x${rows[0].length} table; found ${table.rowCount}x${table.columnCount}`);
  }
  rows.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
    table.getCell(rowIndex, columnIndex).value = value;
  }));
}

await fs.access(sourcePath);
await fs.mkdir(stageDir, { recursive: true });
await fs.mkdir(path.dirname(finalPath), { recursive: true });
try {
  await fs.access(finalPath);
  throw new Error(`Refusing to overwrite existing output: ${finalPath}`);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
if (presentation.slides.items.length !== 12) {
  throw new Error(`Expected the inspected 12-slide source deck; found ${presentation.slides.items.length}`);
}

const originalTestSlide = presentation.slides.items[10];
const updateSlide = originalTestSlide.duplicate();
updateSlide.moveTo(10);

textShape(updateSlide, "10. Result & Testing").text = "10. Latest Implementation";
textShape(updateSlide, "Prototype verification against the required user journeys").text =
  "Recent product, integration and presentation updates";

const updateTable = updateSlide.tables.items[0];
updateTable.frame = { ...updateTable.frame, top: updateTable.frame.top - 5 };
writeTable(updateTable, [
  ["Workstream", "Latest implementation", "State"],
  ["Homepage & design", "NGO-first India home; fresh palette, credited photos and Bootstrap 5.", "Built"],
  ["Role-based journeys", "Next.js donor, receiver and admin flows share JWT authentication.", "Built"],
  ["API & security", "Express routes use JWT verification and role guards.", "Wired"],
  ["Geo discovery & data", "GeoJSON + $geoNear power nearby lists and map markers.", "Wired"],
  ["Pickup, ESG & Figma", "Modal fix; 2.5× CO₂e reporting; Figma screens and UI polish.", "Refined"],
]);

const updateFooter = updateSlide.shapes.items.find(item => item.name === "TextBox 9");
if (!updateFooter) throw new Error("Could not find the duplicated slide footer note.");
updateFooter.text = "Local demo needs MongoDB + API :5000 + web :3000; phone/LAN access remains unverified.";
updateSlide.speakerNotes.text = [
  "LATEST IMPLEMENTATION — presenter notes",
  "",
  "Product and visual system: the public homepage was refocused on surplus-food rescue and NGO/receiver audiences in India. Credited community/NGO and food photography, a new warm palette, Bootstrap 5 responsive grid utilities and clearer calls to action replace the earlier visual treatment.",
  "",
  "Frontend journeys: Next.js App Router pages use shared authentication state and role-aware navigation for donor, receiver and admin roles. The API client reads NEXT_PUBLIC_API_URL (default http://localhost:5000/api) and attaches JWT Bearer tokens. Donor flows create listings; receiver flows discover and claim surplus; admin flows support oversight.",
  "",
  "Backend integration: Express mounts health, auth, listings, claims, admin and reports route families. Authentication verifies JWTs, and requireRole guards role-specific actions. Mongoose persists users, listings, claims, categories and audit logs. The health endpoint is /api/health.",
  "",
  "Location and pickup: listings store GeoJSON Point coordinates as [longitude, latitude] and use a 2dsphere index. Nearby discovery uses MongoDB $geoNear rather than arithmetic distance. Receiver results are represented in both the list and Leaflet map. Listing details use a scrollable modal layered above the map. Claiming is atomic; pickup completion records an audit event.",
  "",
  "Impact and design delivery: completed pickup weight feeds reports using 1 kg of rescued food = 2.5 kg CO₂e avoided (meal equivalent: 2 meals/kg). The existing FoodBridge Figma file/page was updated; recent polish corrected bullet alignment, organization initials, form labels and palette swatches, and added prototype motion.",
  "",
  "Local demo: MongoDB is expected at mongodb://127.0.0.1:27017/foodbridge. Start the backend with npm run dev from backend, then start the frontend with npm run dev from frontend; defaults are API port 5000 and web port 3000. Open the frontend on the laptop after confirming /api/health. Phone/LAN access has not been verified and requires matching network reachability, firewall access and a LAN-reachable API URL.",
].join("\n");

textShape(originalTestSlide, "10. Result & Testing").text = "11. Integration & Demo Check";
textShape(originalTestSlide, "Prototype verification against the required user journeys").text =
  "Implemented pathways are in place; live end-to-end checks require the local API and database";
const testTable = originalTestSlide.tables.items[0];
testTable.frame = { ...testTable.frame, top: testTable.frame.top - 5 };
writeTable(testTable, [
  ["Flow", "Behavior covered", "Current state"],
  ["Donor login + Quick Add", "JWT sign-in; donor-only listing creation with a pickup window.", "Implemented"],
  ["Nearby discovery", "API results appear in the list and as location-based map markers.", "Implemented"],
  ["Claim workflow", "Receiver claim checks availability and assigns an available listing atomically.", "Route present"],
  ["Pickup workflow", "Authorized completion updates claim state and records an audit event.", "Route present"],
  ["Admin + ESG reports", "Role-guarded admin and report routes aggregate completed pickup weight.", "Route present"],
]);
originalTestSlide.speakerNotes.text =
  "Verification note: statuses describe implemented UI/routes, not a claim that every service was running during this deck update. The API depends on MongoDB at mongodb://127.0.0.1:27017/foodbridge. Check http://localhost:5000/api/health, run the backend from backend with npm run dev, then the frontend from frontend with npm run dev. The browser should use the laptop's frontend at http://localhost:3000. Phone/LAN access is still unverified.";

textShape(presentation.slides.items[12], "11. Conclusion & References").text = "12. Conclusion & References";

for (const [index, slide] of presentation.slides.items.entries()) {
  const numberShape = slide.shapes.items.find(item => item.name === "Slide Number Placeholder 3");
  if (numberShape) numberShape.text = String(index + 1);
}

const candidatePath = path.join(stageDir, "candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const sourceHash = crypto.createHash("sha256").update(await fs.readFile(sourcePath)).digest("hex");
const { finalizePresentation } = await import(pathToFileURL(
  path.join(skillDir, "container_tools/artifact_tool_utils.mjs"),
).href);

// This Windows/OneDrive workspace denies hard-link creation. Keep the finalizer's
// no-overwrite guarantee with an exclusive copy; it then hashes and re-reads the
// published bytes exactly as it normally does after a hard link.
const originalLink = fs.link;
fs.link = (from, to) => fs.copyFile(from, to, fsConstants.COPYFILE_EXCL);
let result;
try {
  result = await finalizePresentation({
  explicitTotalSlideCount: 13,
  requiredNativeTableOwnerSlides: [11, 12],
  workspaceDir: projectDir,
  candidatePath,
  finalPath,
  pythonExecutable: runtimePython,
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
    referencePath: sourcePath,
    referenceSha256: sourceHash,
  },
  verifyArtifactToolImport: true,
    receiptPath: path.join(stageDir, "FoodBridge_WPL_Presentation_Updated.final-validation-v2.json"),
  });
} finally {
  fs.link = originalLink;
}

const finalHash = crypto.createHash("sha256").update(await fs.readFile(finalPath)).digest("hex");
console.log(JSON.stringify({ finalPath, finalHash, slideCount: presentation.slides.items.length, finalized: Boolean(result.finalPath) }, null, 2));
