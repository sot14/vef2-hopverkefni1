import { pagedQuery } from '../src/db.js';
import { addPageMetadata } from '../src/utils.js';

export async function listSeasons(req, res) {
    const { offset = 0, limit = 10 } = req.query;
    const { id } = req.params;
    console.log("req params", id);
    console.log(req.path);

    const seasons = await pagedQuery(
        `SELECT *
            FROM series
            WHERE FK_serie = $1`,
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