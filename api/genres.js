import { query, pagedQuery } from '../src/db.js';

export async function listGenres(req, res) {
    
    let genres;
    const { offset = 0, limit = 10 } = req.query;
    try {
        genres = await pagedQuery(`SELECT * FROM genres`, [], {offset, limit});
    } catch (e) {
        console.error('Villa við að sækja genres');
    }
    if (!genres) {
        return res.status(404).json({ error: 'Genres not found' });
    }
    return res.json(genres);
}