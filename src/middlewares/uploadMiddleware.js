const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
require("dotenv").config();

// ตั้งค่า AWS S3 Client (SDK v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// ฟังก์ชันตรวจสอบไฟล์ (เฉพาะ `.jpg`, `.jpeg`, `.png`)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, and .png files are allowed!"), false);
  }
};

// ตั้งค่าการอัปโหลดไฟล์ไปยัง S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, //เซ็ต Content-Type อัตโนมัติ
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `uploads/${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 5MB
  fileFilter: fileFilter,
});

// ฟังก์ชันลบไฟล์จาก S3
const deleteFileFromS3 = async (fileUrl) => {
  try {
    if (!fileUrl) {
      console.error("⚠️ No file URL provided for deletion");
      return;
    }

    // ดึง `Key` จาก URL เช่น `uploads/filename.png`
    const key = fileUrl.split("/").slice(-2).join("/"); // ดึง path ย่อย เช่น `uploads/xxxx.png`
    console.log(`🗑️ Deleting file from S3: ${key}`);

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    });

    await s3.send(command);
    console.log(`✅ File deleted from S3: ${key}`);
  } catch (error) {
    console.error("❌ Error deleting file from S3:", error);
  }
};

module.exports = { upload , deleteFileFromS3 };
