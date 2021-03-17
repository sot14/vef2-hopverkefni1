import { uploadImagesFromDisk } from './images.js';
import { readDataFromCSV } from './tv.js';
import { query } from './db.js';


function main() {
    console.log('hello');
    let images = [];
    try {
        images = uploadImagesFromDisk('./data/img');
    } catch(e) {
        console.error('Villa við að senda myndir', e);
    }

    const series = readDataFromCSV('./data/series.csv');
    series.forEach((serie) => {
        const queryString = `INSERT INTO series(name, aired, inProduction, tagline, thumbnail, description, language, network, url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`);
        
        const values = [
            serie.name,
            serie.airDate,
            serie.genres,
            serie.inProduction,
            serie.tagline,
            serie.image, // TODO: rétt image
            serie.description,
            serie.language,
            serie.network,
            serie.homepage
        ];
        await query(queryString, values);
    }
    // id: '1',
    // name: 'WandaVision',
    // airDate: '2021-01-15',
    // genres: 'Sci-Fi & Fantasy,Mystery,Drama',
    // inProduction: 'true',
    // tagline: 'Experience a new vision of reality.',
    // image: 'glKDfE6btIRcVB5zrjspRIs4r52.jpg',
    // description: 'Wanda Maximoff and Vision—two super-powered beings living idealized suburban lives—begin to suspect that everything is not as it seems.',
    // language: 'en',
    // network: 'Disney+',
    // homepage: 'https://www.disneyplus.com/series/wandavision/4SrN28ZjDLwH'
}

main().catch((err) => {
    console.error(err);
  });