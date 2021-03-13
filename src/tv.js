import fs from 'fs';
import csv from 'csv-parser';

const read = fs.createReadStream('./data/series.csv', {encoding: 'utf8'});
let data = [];
read.pipe(csv({headers: false, seperator: ','}));
read.on('data', (chunk) => {
    let item = {
        bla: chunk[0],
        blabla: chunk[1],
        blablabla: chunk[2]
    }
    data.push(item);
  console.log('chunk', chunk);
});

read.on('close', () => {
  console.log('file read');
});

read.on('end', () => {
    console.log("data", data);
    return data;
})