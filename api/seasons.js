import { pagedQuery } from '../src/db.js';
import { addPageMetadata, catchErrors } from '../src/utils.js';
import express from 'express';
import { isInt } from '../authentication/validations.js';

export const router = express.Router();

export async function listSeasons(req, res) {
    const { offset = 0, limit = 10 } = req.query;
    const { id } = req.params;
    console.log("req params", id);
    console.log(req.path);

    const seasons = await pagedQuery(
        `SELECT id, name, seasonno, aired, description, seasonposter
            FROM season
            WHERE FK_serie = $1
            ORDER BY seasonNo`,
        [id],
        { offset, limit },
    );
    console.log(seasons);
    const seasonsWithPage = addPageMetadata(
        seasons,
        req.path,
        { offset, limit, length: seasons.items.length },
      );
      return res.json(seasonsWithPage);
}

// Birtir upplýsingar um staka seríu
export async function listSeason( req, res) {
    const { serieNumber, seasonNumber } = req.params;
    const { offset = 0, limit = 10 } = req.query;
  
    const season = await pagedQuery(
      `SELECT
      *
      FROM
        season
      WHERE seasonNo = $1
      AND FK_serie = $2`,
      [seasonNumber, serieNumber],
      {offset, limit}
    );
    console.log("found season", season);
  
    if (!season ) {
      return res.status(404).json({ error: 'Season not found' });
    }
   
    return res.json(season);
  }
  

// router.get('/', catchErrors(listSeasons));
// router.get('/:id', catchErrors(listSeason));