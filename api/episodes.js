import { pagedQuery, query } from '../src/db.js';

export async function listEpisode(req, res) {
    const { serieNumber, seasonNumber, episodeNumber } = req.params;
    const episodes = await query(
        `SELECT * FROM episodes
        WHERE FK_serie=$1
        AND seasonnumber=$2
        AND episodeNo=$3`,
        [serieNumber, seasonNumber, episodeNumber]);
    const episodeItems = episodes.rows;
    if (!episodes) {
        return res.status(404).json({ error: 'Episode not found' });
        }
    
    return res.json(episodeItems);
}