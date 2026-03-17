const asyncHandler   = require("express-async-handler");
const { cloudinary } = require("../config/cloudinary");
const streamifier    = require("streamifier");

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "mahalaxmi_steels/products",
        transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// POST /api/upload
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const result = await uploadBufferToCloudinary(req.file.buffer);

  res.json({
    url:       result.secure_url,
    public_id: result.public_id,
  });
});

// POST /api/upload/multiple
const uploadImages = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (!files.length) {
    res.status(400);
    throw new Error("No files uploaded");
  }

  const uploaded = [];
  for (const file of files) {
    const result = await uploadBufferToCloudinary(file.buffer);
    uploaded.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
  }

  res.json({ images: uploaded });
});

// DELETE /api/upload/:public_id
const deleteImage = asyncHandler(async (req, res) => {
  await cloudinary.uploader.destroy(req.params.public_id);
  res.json({ message: "Image deleted" });
});

module.exports = { uploadImage, uploadImages, deleteImage };