import express from 'express';
import { catchErrors } from './utils.js';
import { requireAuth, checkUserIsAdmin } from '../authentication/registered.js';
import {router as imageRouter} from './images.js';


const requireAdmin = [
    requireAuth,
    checkUserIsAdmin,
];

export const router = express.Router();

import {
    listUsers,
    listUser,
    updateUserRoute, 
    currentUserRoute,
    updateCurrentUser,
} from './users.js';

import {
    listSeries,
    listSerie,
    router as seriesRouter
} from '../api/series.js'

import {
    listGenres, 
    addGenre
} from '../api/genres.js';
import {
    listSeasons, 
    listSeason,
    createSeason,
    deleteSeason
} from '../api/seasons.js';

import {
    listEpisode,
    createEpisode,
    deleteEpisode
} from '../api/episodes.js';

function indexRoute(req, res) {
    return res.json({
        tv: {
            series: {
                href: '/tv',
                methods: ['GET', 'POST']
            },
            serie: {
                href: '/tv/{id}',
                methods: ['GET', 'PATCH', 'DELETE']
            },
            rate: {
                href: '/tv/{id}/rate',
                methods: ['POST', 'PATCH', 'DELETE']
            },
            state: {
                href: '/tv/{id}/state',
                methods: ['POST', 'PATCH', 'DELETE']
            }
        },
        seasons: {
            seasons: {
                href: '/tv/{id}/season',
                methods: ['GET','POST']
            },
            season: {
                href: '/tv/{id}/season/{season}',
                methods: ['GET', 'DELETE']
            }
        },
        episodes: {
            episodes: {
                href: '/tv/{id}/season/{season}/episode',
                methods: ['POST']
            },
            episode: {
                href: '/tv{id}/season/{season}/episode/{episode}',
                methods: ['GET', 'DELETE']
            }
        },
        genres: {
            genres: {
                href: '/genres',
                methods: ['GET', 'POST']
            }
        },
        users: {
            users: {
                href: '/users',
                methods: ['GET']
            },
            user: {
                href: '/users/{id}',
                methods: ['GET', 'PATCH']
            },
            register: {
                href: '/users/register',
                methods: ['POST']
            },
            login: {
                href: '/users/login',
                methods: ['POST']
            },
            me: {
                href: '/users/me',
                methods: ['GET', 'PATCH']
            }
        }

    })
}


router.get('/',indexRoute);

router.use('/images', imageRouter);

router.get('/users', requireAdmin, catchErrors(listUsers));
router.get('/users/:id', requireAdmin, catchErrors(listUser));
router.patch('/users/:id', requireAdmin, catchErrors(updateUserRoute));
// users/register og users/login eru í registered.js
router.get('/users/me', requireAuth, catchErrors(currentUserRoute));
router.patch('/users/me', requireAuth, catchErrors(updateCurrentUser));

// Routes fyrir tv

router.get('/tv', catchErrors(listSeries));
router.get('/tv/:id', catchErrors(listSerie));

router.get('/tv/:id/season', catchErrors(listSeasons));
router.post('/tv:id/season',requireAdmin, catchErrors(createSeason));
router.get('/tv/:serieNumber/season/:seasonNumber', catchErrors(listSeason));
router.delete('/tv/:serieNumber/season/:seasonNumber', catchErrors(deleteSeason));

router.get('/tv/:serieNumber/season/:seasonNumber/episode/:episodeNumber', catchErrors(listEpisode));
router.post('/tv/:serieNumber/season/:seasonNumber/episode', requireAdmin, catchErrors(createEpisode));
router.delete('/tv/:serieNumber/season/:seasonNumber/episode/:episodeNumber', catchErrors(deleteEpisode));

router.get('/genres', catchErrors(listGenres));
router.post('/genres', requireAdmin, catchErrors(addGenre));

