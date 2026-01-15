import { db } from "./client";


export function iniatilizeDatabase():void{
    try {

        db.execSync(
            `
            -- TRENDING MOVIES
            CREATE TABLE IF NOT EXISTS trending_movies(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tmdb_id INTEGER UNIQUE NOT NULL,
            title TEXT NOT NULL,
            overview TEXT,
            poster_path TEXT,
            backdrop_path TEXT,
            vote_average REAL,
            release_date TEXT,
            cached_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
            );

            -- LATEST MOVIES
            CREATE TABLE IF NOT EXISTS latest_movies(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tmdb_id INTEGER UNIQUE NOT NULL,
            title TEXT NOT NULL,
            overview TEXT,
            poster_path TEXT,
            backdrop_path TEXT,
            vote_average REAL,
            release_date TEXT,
            runtime INTEGER,
            cached_at INTEGER NOT NULL DEFAULT(strftime('%s','now'))
            );

            --LATEST TV SHOWS
            CREATE TABLE IF NOT EXISTS latest_tv_shows(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tmdb_id INTEGER UNIQUE NOT NULL,
            name TEXT NOT NULL,
            overview TEXT,
            poster_path TEXT,
            backdrop_path TEXT,
            vote_average REAL,
            first_air_date TEXT,
            number_of_seasons INTEGER,
            cached_at INTEGER NOT NULL DEFAULT(strftime('%s','now'))
            );

            -- MOVIE/TV-SHOW DETAILS
            CREATE TABLE IF NOT EXISTS content_details(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tmdb_id INTEGER NOT NULL,
            type TEXT NOT NULL CHECK(type IN('movie','tv')),
            data TEXT NOT NULL,
            cached_at INTEGER NOT NULL DEFAULT(strftime('%s','now')),
            UNIQUE(tmdb_id,type)
            );

            -- WATCHLIST
            CREATE TABLE IF NOT EXISTS watchlist(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tmdb_id INTEGER UNIQUE NOT NULL,
            type TEXT NOT NULL  CHECK(type IN('movie','tv')),
            title TEXT NOT NULL,
            poster_path TEXT,
            added_at INTEGER NOT NULL DEFAULT(strftime('%s','now'))
            );

            --WATCH_HISTORY
            CREATE TABLE IF NOT EXISTS watch_history(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tmdb_id INTEGER UNIQUE NOT NULL,
            type TEXT NOT NULL CHECK(type IN('movie','tv')),
            title TEXT NOT NULL,
            poster_path TEXT,
            season_number INTEGER,
            episode_number INTEGER,
            episode_title TEXT,
            last_watched_at INTEGER NOT NULL DEFAULT(strftime('%s','now'))
            );

            -- INDICES
            CREATE INDEX IF NOT EXISTS idx_trending_cached
                ON trending_movies(cached_at);
            
            CREATE INDEX IF NOT EXISTS idx_movies_cached
                ON latest_movies(cached_at);
            
            CREATE INDEX IF NOT EXISTS idx_shows_cached
                ON latest_tv_shows(cached_at);
            
            CREATE INDEX IF NOT EXISTS idx_details_lookup
                ON content_details(tmdb_id,type);
                
            CREATE INDEX IF NOT EXISTS idx_watchlist_tmdb
                ON watchlist(tmdb_id);
                
            CREATE INDEX IF NOT EXISTS idx_watchlist_added
                ON watchlist(added_at DESC);
            
            CREATE INDEX IF NOT EXISTS idx_history_watched
                ON watch_history(last_watched_at DESC);

            CREATE INDEX IF NOT EXISTS idx_history_tmdb
                ON watch_history(tmdb_id,type);  
            `
         )
         console.log('Dtabase Schema Initialized Successfully')

         const stats = getTableStats()

         console.log('Database Stats',stats)
        
    } catch (error) {
        console.error('Database Initialization Failed',error)
        throw error
    }
}

function getTableStats(){
    const tables = [
        'trending_movies',
    'latest_movies', 
    'latest_tv_shows',
    'content_details',
    'watchlist',
    'watch_history'
    ]

    const stats: Record<string,number> = {}

    for(const table of tables){
        const results = db.getFirstSync<{count:number}>(
            `SELECT COUNT(*) as count FROM ${table}`)
        
        stats[table] = results?.count || 0
    }
    return stats
}