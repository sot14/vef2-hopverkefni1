import fs from 'fs';
import csvParser from 'csv-parser';
import express from 'express';
export const router=express();

export async function readDataFromCSV(file) {
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
        return data;
    })
    return data;
}

router.get('/', (req, res) => {
    res.render('tv');
  });

//export const series = readDataFromCSV('./data/series.csv');
// export const seasons = readDataFromCSV('./data/seasons.csv');
//export const episodes = readDataFromCSV('./data/episodes.csv');


