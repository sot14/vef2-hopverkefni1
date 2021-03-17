import util from 'util';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import express from 'express';

const readDirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);
const resourcesAsync = util.promisify(cloudinary.api.resources);
const uploadAsync = util.promisify(cloudinary.uploader.upload);

export const router = express.Router();

// Cloudinary er stillt sjálfkrafa því við höfum CLOUDINARY_URL í umhverfi

// Geymum í minni niðurstöður úr því að lista allar myndir frá Cloudinary
let cachedListImages = null;

const {
  PORT: port = 3000,
  CLOUDINARY_URL: cloudinaryUrl,
} = process.env;

dotenv.config();

async function listImages() {
  if (cachedListImages) {
    return Promise.resolve(cachedListImages);
  }
  console.log('before resourcesasync');
  // TODO hér þyrfti að taka við pageuðum niðurstöðum frá Cloudinary
  // en þar sem við erum með 20 myndir fáum við hámark per request og látum duga
  const res = await resourcesAsync({ max_results: 100 });
  console.log('after resourcesasync');
  cachedListImages = res.resources;
  console.log(cachedListImages);

  return res.resources;
}

function imageComparer(current) {
  // TODO hér ættum við að bera saman fleiri hluti, t.d. width og height
  return uploaded => uploaded.bytes === current.size;
}

async function getImageIfUploaded(imagePath) {
  const uploaded = await listImages();
  console.log('back from listimages');

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

  console.log(`Bæti við ${filteredImages.length} myndum á ${cloudinaryUrl}`);

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


