import fs from 'fs';

const read = fs.createReadStream('./data/series.csv');

read.on('data', (chunk) => {
  console.log('chunk', chunk);
});

read.on('close', () => {
  console.log('file read');
});