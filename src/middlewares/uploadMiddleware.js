const multer = require('multer');
const path = require('path');
const supabase = require('../utils/supabaseClient');
const sharp = require('sharp');

const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME;
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/heic", "image/heif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed!"), false);
  }
});

// ฟังก์ชันอัปโหลดไฟล์ไป Supabase
async function uploadToSupabase(fileBuffer, originalname) {
  const fileExt = path.extname(originalname);
  const fileName = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

  // Resize รูปภาพ 
  const resizedBuffer = await sharp(fileBuffer)
    .resize({ width: 1024, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName.replace(fileExt, '.webp'), resizedBuffer, {
      contentType: 'image/webp'
    });
  if (error) throw error;
  const { data: publicUrl } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName.replace(fileExt, '.webp'));
  return publicUrl.publicUrl;
}

module.exports = { upload, uploadToSupabase };