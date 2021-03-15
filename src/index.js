
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
        }

    })
};

router.use('/', indexRoute);