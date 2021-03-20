module.exports = {
    ALBUM_META_JSON: 'album-1-to-10.json',
    ALBUM_EXTRA_JSON: 'album-11-plus.json',
    ALBUM_META_JSON_BACKUP: 'album-meta.json',
    APP_LOCAL_DIRECTORY: '++app',
    DEFAULT_IMAGE_DIRECTORY: '++original',
    DEMO_ALBUM: 'demo-album',
    GALLERY_IS_HOME_PAGE: 'GALLERY_IS_HOME_PAGE',
    SITE_CONFIG: 'site-config.json',
    NAV_META_JSON: 'nav-meta.json',

    SVG_CONSTANTS: {
        NOTES: [
            'These settings are used in /kaboom/src/ingest-resize/build-svg.js',
            'More candidate & mutations make better images.',
            'Less candidates & mutations make the process quicker.',
            'More CPU threads can make the process quicker.'
        ],
        SVG_SHAPE_CANDIDATES: 2048, 
        SVG_SHAPE_MUTATIONS: 2048,
        CPU_THREADS: 4
    },

    DEMO_PIX: [
        'kaboom_1_demo.png',
        'kaboom_2_demo.jpg',
        'kaboom_3_demo.jpeg',
        'kaboom_4_demo.gif'
    ],

    INIT_STATUS: 'THE VALUES BELOW SHOULD BE UPDATED WHEN THE "kaboom init" CLI COMMAND RUNS',
    APP_DIRECTORY: './app/pages',
    DUMMY_RESOURCE_PATH: './src/dummy',
    REMOTE_URLS_JSON: './src/remote-urls.json',
    GALLERY_MAIN_PATH: './gallery',
    PROCESS_DIRECTORY: './src',
    DUMMY: true
};
