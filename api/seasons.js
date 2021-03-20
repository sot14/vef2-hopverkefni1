import { pagedQuery } from '../src/db.js';
import { addPageMetadata } from '../src/utils.js';

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
export async function listSeason(req, res) {
    const { id } = req.params;
    console.log("list seaosns", req.params);
    console.log("body", req);
    const season = await findSeason(id);
  
    if (!season) {
      return res.status(404).json({ error: 'Season not found' });
    }
  
    return res.json(season);
  }
  
  // Finnur seríu út frá id 
  export async function findSeason(id) {
    if (!isInt(id)) {
      return null;
    }
  
    const season = await query(
      `SELECT
      *
      FROM
        season
      WHERE id = $1`,
      [id],
    );
  
    if (season.rows.length !== 1) {
      return null;
    }
  
    return season.rows[0];
  }