const asyncHandler = require("express-async-handler");
const streamifier = require("streamifier");
const { cloudinary } = require("../config/cloudinary");
const Hero = require("../models/Hero");

const HERO_FOLDER = "mahalaxmi_steels/hero";

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: HERO_FOLDER,
        transformation: [{ width: 1800, height: 900, crop: "limit", quality: "auto" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

const getOrCreateHero = async () => {
  let hero = await Hero.findOne();
  if (!hero) hero = await Hero.create({ images: [] });
  return hero;
};

// GET /api/hero
const getHeroImages = asyncHandler(async (req, res) => {
  const hero = await getOrCreateHero();
  res.json({ images: hero.images || [] });
});

// POST /api/hero/add
const addHeroImages = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (!files.length) {
    res.status(400);
    throw new Error("No files uploaded");
  }

  const uploadedImages = [];
  for (const file of files) {
    const result = await uploadBufferToCloudinary(file.buffer);
    uploadedImages.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
  }

  const hero = await getOrCreateHero();
  hero.images.push(...uploadedImages);
  await hero.save();

  res.status(201).json({
    message: "Hero images uploaded successfully",
    images: hero.images,
  });
});

// DELETE /api/hero/:id
const deleteHeroImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hero = await Hero.findOne();

  if (!hero) {
    res.status(404);
    throw new Error("Hero document not found");
  }

  const image = hero.images.id(id);
  if (!image) {
    res.status(404);
    throw new Error("Hero image not found");
  }

  await cloudinary.uploader.destroy(image.public_id);
  image.deleteOne();
  await hero.save();

  res.json({
    message: "Hero image deleted",
    images: hero.images,
  });
});

module.exports = {
  getHeroImages,
  addHeroImages,
  deleteHeroImage,
};
