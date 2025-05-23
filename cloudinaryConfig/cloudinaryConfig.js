const cloudinary = require('cloudinary').v2;
console.log( process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
