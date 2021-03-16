import express from 'express';
import { catchErrors } from './utils.js';
import { requireAuth, checkUserIsAdmin } from '../authentication/registered.js'

const requireAdmin = [
    requireAuth,
    checkUserIsAdmin,
];

export const router = express();

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
        users: {
            users: '/users',
            user: '/users/{id}',
            register: '/users/register',
            login: '/users/login',
            me: '/users/me',
        }, 

    })
}
router.use('/', indexRoute);
router.get('/users', requireAdmin, catchErrors(listUsers));
/*
router.get('/users', requireAdmin, catchErrors(listUsers));
router.get('/users/me', requireAuth, catchErrors(currentUser));
router.patch('/users/me', requireAuth, catchErrors(updateCurrentUser));
router.get('/users/:id', requireAdmin, catchErrors(listUser));
router.patch('/users/:id', requireAdmin, catchErrors(updateUser));*/