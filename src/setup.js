import { uploadImagesFromDisk } from './images.js';
import { readDataFromCSV } from './tv.js';
import { query } from './db.js';
import dotenv from 'dotenv';
import fs from 'fs';
import util from 'util';
import csvParser from 'csv-parser';

const readFileAsync = util.promisify(fs.readFile);

const {
    DATABASE_URL: databaseUrl,
    CLOUDINARY_URL: cloudinaryUrl,
    IMAGE_FOLDER: imageFolder = './data/img',
  } = process.env;

dotenv.config();

async function main () {
    console.info(`Set upp gagnagrunn á ${databaseUrl}`);
    console.info(`Set upp tengingu við Cloudinary á ${cloudinaryUrl}`);
    // let images = [];
    // try {
    //     console.log(imageFolder);
    //     images = await uploadImagesFromDisk(imageFolder);
    // } catch(e) {
    //     console.error('Villa við að senda myndir', e);
    // }

    // console.log(images);

     // henda töflum
    try {
        const createTable = await readFileAsync('./sql/drop.sql');
        await query(createTable.toString('utf8'));
        console.info('Töflum hent');
    } catch (e) {
        console.error('Villa við að henda töflum:', e.message);
        return;
    }

    // búa til töflur út frá skema
    try {
        const createTable = await readFileAsync('./sql/schema.sql');
        await query(createTable.toString('utf8'));
        console.info('Tafla búin til');
    } catch (e) {
        console.error('Villa við að búa til töflu:', e.message);
        return;
    }

    const series = await readDataFromCSV('./data/series.csv');

    const seasons = await readDataFromCSV('./data/seasons.csv');
    
    const episodes = await readDataFromCSV('./data/episodes.csv');
    
    // Kom ekki inn á réttum tíma þrátt fyrir await svo þurfti að nota settimeout
    setTimeout(async () => {
        await insertSeries(series); //inserts series and genres
        await insertSeasons(seasons);
        await insertEpisodes(episodes);
    }, 2000);
    

    // episodes::
    // name: 'Apple',
    // number: '8',
    // airDate: '',
    // overview: "During a robbery at the grocery mart Dr. Shaun Murphy is shopping at, his communication limitations puts lives at risk. Meanwhile, after Shaun's traumatic day, Dr. Aaron Glassman worries that he isn't doing enough to help Shaun.",
    // season: '1',
    // serie: 'The Good Doctor',
    // serieId: '3'

    // series::
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

async function insertSeries(series) {
    console.log('setting up series', series.length);
    let TVGenres = [];
    series.forEach((serie) => {
        // let cloudImage;
        // console.log(images.some(item => item.))
        
        let result = [];
        const queryString = 'INSERT INTO series(id, name, aired, inProduction, tagline, thumbnail, description, language, network, url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
        
        const values = [
            serie.id,
            serie.name,
            serie.airDate,
            serie.inProduction,
            serie.tagline,
            serie.image, 
            serie.description,
            serie.language,
            serie.network,
            serie.homepage
        ];
        try {
            query(queryString, values);
        } catch(e) {
            console.error('villa við að inserta series', e);
        }

        

        let currentGenres = serie.genres;
        currentGenres = currentGenres.split(',');
        currentGenres.forEach(async (genre) => {

           
            // find unique genres
            if(!TVGenres.includes(genre)) {
                TVGenres.push(genre);
            }
        });
        
    });

    TVGenres.forEach((genre) => {
        const queryString = `INSERT INTO genres(name) VALUES ($1);`;
        const values = [genre];

        try {
            query(queryString, values);
        } catch(e) {
            console.error('villa við að inserta genres', e);
        }

    });

    await series.forEach(async(serie) => {
        console.log('inserting seriegenres');
        const serieGenres = serie.genres.split(',');
        console.log(serieGenres);
        await serieGenres.forEach(async(serieGenre) => {
            console.log(serieGenre);
            
            const genreQuery = 'INSERT INTO series_genres(serie, genre) VALUES($1, $2)';

            const genreValues = [
                serie.id,
                serieGenre
            ]
            try {
                console.log('inserting into series_genres');
                await query(genreQuery, genreValues);
            } catch(e) {
                console.error('villa við að inserta í series_genres', e);
            }
        });
        
        
    })
        
}

async function insertSeasons(seasons) {
    console.log('inserting seasons', seasons.length);

    seasons.forEach((season) => {
        const queryString = `INSERT INTO season(name, seasonNo, aired, description, seasonPoster, serieName, FK_serie) VALUES ($1, $2, $3, $4, $5, $6, $7);`;
        
        const values = [
            season.name,
            season.number,
            season.airDate,
            season.overview,
            season.poster,
            season.serie,
            season.serieId
        ];
        try {
            query(queryString, values);
        } catch (e) {
            console.error('Villa við að inserta seasons', e);
        }
    });
}

async function insertEpisodes(episodes) {
    console.log('inserting episodes', episodes.length);
    episodes.forEach((episode) => {
        const queryString = `INSERT INTO episodes(name, episodeNo, aired, description) VALUES ($1, $2, $3, $4);`;
        
        const values = [
            episode.name,
            episode.number,
            episode.airDate,
            episode.overview
            // episode.season,
        ];
        try {
            query(queryString, values);
        } catch (e) {
            console.error('Villa við að inserta episodes', e);
        }
    });
}
main().catch((err) => {
    console.error(err);
  });