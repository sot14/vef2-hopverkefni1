import fs from 'fs';
import csvParser from 'csv-parser';
import express from 'express';
export const router=express();

export function readDataFromCSV(file) {
    const read = fs.createReadStream(file, {encoding: 'utf8'}).pipe(csvParser());
    let data = [];
    read.on('error', () => {
        console.log("error");
    });

    read.on('data', (chunk) => {
        data.push(chunk);
    });

    read.on('close', () => {
    console.log('file read');
    });

    read.on('end', () => {
        console.log(data);
        return data;
    })
    return data;
}

router.get('/', (req, res) => {
    res.render('tv');
  });

<<<<<<< HEAD
export const series = readDataFromCSV('./data/series.csv');
//export const seasons = readDataFromCSV('./data/seasons.csv');
//export const episodes = readDataFromCSV('./data/episodes.csv');

console.log('here');
console.log(series);
=======
export const series =readDataFromCSV('../data/series.csv');
//readDataFromCSV('./data/seasons.csv');
//readDataFromCSV('./data/episodes.csv');
>>>>>>> b3082e571089dfae7b810c30b78ae88fdbbfdea1


