import express from 'express';
import { catchErrors } from './utils.js';
import { requireAuth, checkUserIsAdmin } from '../authentication/registered.js'

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

router.get('/users', requireAdmin, catchErrors(listUsers));
router.get('/users/:id', requireAdmin, catchErrors(listUser));
router.patch('/users/:id', requireAdmin, catchErrors(updateUserRoute));
// users/register og users/login eru í registered.js
router.get('/users/me', requireAuth, catchErrors(currentUserRoute));
router.patch('/users/me', requireAuth, catchErrors(updateCurrentUser));

// Routes fyrir tv

router.get('/tv:id', requireAdmin, catchErrors());
router.get('/users/:id', requireAdmin, catchErrors());


