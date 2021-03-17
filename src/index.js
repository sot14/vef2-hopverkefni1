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
    //listUser,
    //updateUserRoute as updateUser,
    //currentUserRoute as currentUser,
    //updateCurrentUser,
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
};


router.use('/', indexRoute);
//         users: {
//             users: '/users',
//             user: '/users/{id}',
//             register: '/users/register',
//             login: '/users/login',
//             me: '/users/me',
//         }, 

//     })
// }
router.use('/images', imageRouter);
router.get('/users', requireAdmin, catchErrors(listUsers));
/*
router.get('/users', requireAdmin, catchErrors(listUsers));
router.get('/users/me', requireAuth, catchErrors(currentUser));
router.patch('/users/me', requireAuth, catchErrors(updateCurrentUser));
router.get('/users/:id', requireAdmin, catchErrors(listUser));
router.patch('/users/:id', requireAdmin, catchErrors(updateUser));*/
