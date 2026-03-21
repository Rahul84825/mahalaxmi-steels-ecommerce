const fs = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");

const { cloudinary } = require("./config/cloudinary");

dotenv.config();

const ROOT_DIR = __dirname;
const OUTPUT_FILE = path.resolve(
  ROOT_DIR,
  process.env.CLOUDINARY_IMAGE_OUTPUT_FILE || "cloudinaryImages.json"
);
const CLOUDINARY_BASE_FOLDER =
  process.env.CLOUDINARY_SEED_FOLDER || "mahalaxmi_steels/products";

const CANDIDATE_IMAGE_DIRS = [
  process.env.SEED_IMAGES_DIR,
  path.join(ROOT_DIR, "seedImages"),
  path.join(ROOT_DIR, "uploads"),
].filter(Boolean);

function normalizeGroupName(input) {
  return String(input || "misc")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function isImageFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectImageFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectImageFiles(fullPath);
      files.push(...nested);
    } else if (entry.isFile() && isImageFile(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function inferGroupName(filePath, baseDir) {
  const relativeDir = path.relative(baseDir, path.dirname(filePath));
  if (relativeDir && relativeDir !== ".") {
    const firstSegment = relativeDir.split(path.sep)[0];
    return normalizeGroupName(firstSegment);
  }

  const baseName = path.basename(filePath, path.extname(filePath));
  const prefix = baseName.split(/[-_]/)[0];
  return normalizeGroupName(prefix || "misc");
}

async function readExistingCloudinaryData() {
  if (!(await pathExists(OUTPUT_FILE))) {
    return {};
  }

  const raw = await fs.readFile(OUTPUT_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (error) {
    console.warn(
      `[warn] Could not parse ${path.basename(OUTPUT_FILE)}. Starting fresh. ${error.message}`
    );
  }

  return {};
}

function buildPublicId(groupName, filePath) {
  const rawName = path.basename(filePath, path.extname(filePath));
  const safeName = normalizeGroupName(rawName).replace(/-/g, "_") || "image";
  return `${CLOUDINARY_BASE_FOLDER}/${groupName}/${safeName}`;
}

async function ensureCloudinaryEntry(publicId, filePath) {
  try {
    const existing = await cloudinary.api.resource(publicId, { resource_type: "image" });
    return {
      url: existing.secure_url,
      public_id: existing.public_id,
      uploaded: false,
    };
  } catch (error) {
    if (error.http_code !== 404) {
      throw error;
    }
  }

  const uploaded = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    resource_type: "image",
    overwrite: false,
    unique_filename: false,
  });

  return {
    url: uploaded.secure_url,
    public_id: uploaded.public_id,
    uploaded: true,
  };
}

function addUniqueEntry(groupedData, groupName, imageEntry) {
  if (!groupedData[groupName]) {
    groupedData[groupName] = [];
  }

  const exists = groupedData[groupName].some(
    (item) => item.public_id === imageEntry.public_id
  );

  if (!exists) {
    groupedData[groupName].push({
      url: imageEntry.url,
      public_id: imageEntry.public_id,
    });
  }
}

async function resolveImageBaseDir() {
  for (const dir of CANDIDATE_IMAGE_DIRS) {
    const absolute = path.isAbsolute(dir) ? dir : path.resolve(ROOT_DIR, dir);
    if (await pathExists(absolute)) {
      return absolute;
    }
  }

  return null;
}

async function runImageSeeder() {
  try {
    const baseDir = await resolveImageBaseDir();
    if (!baseDir) {
      throw new Error(
        `No image folder found. Checked: ${CANDIDATE_IMAGE_DIRS
          .map((dir) => path.isAbsolute(dir) ? dir : path.resolve(ROOT_DIR, dir))
          .join(", ")}`
      );
    }

    console.log(`[start] Reading local images from: ${baseDir}`);
    const imageFiles = await collectImageFiles(baseDir);

    if (!imageFiles.length) {
      throw new Error(`No image files found in ${baseDir}`);
    }

    const groupedData = await readExistingCloudinaryData();
    let uploadedCount = 0;
    let reusedCount = 0;

    console.log("Uploading images...");
    for (const filePath of imageFiles) {
      const groupName = inferGroupName(filePath, baseDir);
      const publicId = buildPublicId(groupName, filePath);

      const cloudinaryEntry = await ensureCloudinaryEntry(publicId, filePath);
      addUniqueEntry(groupedData, groupName, cloudinaryEntry);

      if (cloudinaryEntry.uploaded) {
        uploadedCount += 1;
        console.log(`[uploaded] ${filePath} -> ${cloudinaryEntry.public_id}`);
      } else {
        reusedCount += 1;
        console.log(`[skipped] Existing image reused for ${filePath}`);
      }
    }

    await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(groupedData, null, 2)}\n`, "utf8");
    console.log(`Saved Cloudinary data to ${OUTPUT_FILE}`);
    console.log(`[done] Uploaded: ${uploadedCount}, Reused: ${reusedCount}`);
    process.exit(0);
  } catch (error) {
    console.error(`[error] imageSeeder failed: ${error.message}`);
    process.exit(1);
  }
}

runImageSeeder();