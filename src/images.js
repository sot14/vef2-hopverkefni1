import util from 'util';
import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

const readDirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);
const resourcesAsync = util.promisify(cloudinary.api.resources);
const uploadAsync = util.promisify(cloudinary.uploader.upload);
console.log('resourcesAsync', cloudinary.api.resources);
console.log('uploadasync', cloudinary.uploader.upload);

// Cloudinary er stillt sjálfkrafa því við höfum CLOUDINARY_URL í umhverfi

// Geymum í minni niðurstöður úr því að lista allar myndir frá Cloudinary
let cachedListImages = null;

const {
  PORT: port = 3000,
} = process.env;

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function listImages() {
  if (cachedListImages) {
    return Promise.resolve(cachedListImages);
  }

  console.log('after promise list images');
  // TODO hér þyrfti að taka við pageuðum niðurstöðum frá Cloudinary
  // en þar sem við erum með 20 myndir fáum við hámark per request og látum duga
  const res = await resourcesAsync({ max_results: 100 });

  console.log('resourcesasync', res);
  cachedListImages = res.resources;

  return res.resources;
}

function imageComparer(current) {
  // TODO hér ættum við að bera saman fleiri hluti, t.d. width og height
  return uploaded => uploaded.bytes === current.size;
}

async function getImageIfUploaded(imagePath) {
  const uploaded = await listImages();

  const stat = await statAsync(imagePath);

  const current = { size: stat.size };

  const found = uploaded.find(imageComparer(current));

  return found;
}

async function uploadImageIfNotUploaded(imagePath) {
  console.log('check if uploaded');
  const alreadyUploaded = await getImageIfUploaded(imagePath);

  if (alreadyUploaded) {
    console.log(`Mynd ${imagePath} þegar uploadað`);
    return alreadyUploaded.secure_url;
  }
  console.log('gonna upload async');
  const uploaded = await uploadAsync(imagePath);
  console.log(`Mynd ${imagePath} uploadað`);

  return uploaded.secure_url;
}

export async function uploadImagesFromDisk(imageDir) {
  const imagesFromDisk = await readDirAsync(imageDir);

  const filteredImages = imagesFromDisk
    .filter(i => path.extname(i).toLowerCase() === '.jpg');

  console.log(`Bæti við ${filteredImages.length} myndum`);

  const images = [];

  for (let i = 0; i < filteredImages.length; i++) {
    const image = filteredImages[i];
    const imagePath = path.join(imageDir, image);
    console.log('gonna upload');
    const uploaded = await uploadImageIfNotUploaded(imagePath); // eslint-disable-line
    console.log('uploaded');
    images.push(uploaded);
  }

  console.log('Búið að senda myndir á Cloudinary');

  return images;
}

uploadImagesFromDisk('./data/img');

