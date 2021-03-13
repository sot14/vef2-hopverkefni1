import fs from 'fs';
import csvParser from 'csv-parser';

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
        console.log("data", data);
        return data;
    })
    return data;
}

readDataFromCSV('./data/series.csv');
// readDataFromCSV('./data/seasons.csv');
// readDataFromCSV('./data/episodes.csv');

