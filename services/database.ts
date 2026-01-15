import { db } from "@/db/client";
import { LatestMovie, LatestTvShow, TrendingMovie, WatchHistoryItem, WatchListItem } from "@/db/schema";

export class DatabaseService{

    static cacheTrending(movies:any[]):void{
        db.withTransactionSync(()=>{
            db.runSync('DELETE FROM trending_movies')

            for(const movie of movies){
                db.runSync(
                    `INSERT INTO trending_movies 
                    (tmdb_id,title,overview,poster_path,backdrop_path,vote_average,release_date)
                    VALUES(?,?,?,?,?,?,?)`,
                    movie.id,
                    movie.title,
                    movie.overview || null,
                    movie.poster_path || null,
                    movie.backdrop_path || null,
                    movie.vote_average || null,
                    movie.release_date || null
                )
            }
        })

        console.log(`Cached ${movies.length} trending movies`)
    }

    static getTrending():TrendingMovie[]{
        const rows = db.getAllSync<any>('SELECT * FROM trending_movies')

        return rows.map(row=>({
            id:row.id,
            tmdbId: row.tmdb_id,
            title: row.title,
            overview: row.overview,
            posterPath: row.poster_path,
            backdropPath: row.backdrop_path,
            voteAverage: row.vote_average,
            releaseDate: row.release_date,
            cachedAt: row.cached_at,
        }))
    }

    static shouldRefreshTrending():boolean {
        const result = db.getFirstSync<any>(
            'SELECT cached_at FROM trending_movies LIMIT 1')
        if(!result)return true

        const sixHoursAgo = Math.floor((Date.now()/1000)-(6*60*60))
        return result.cached_at < sixHoursAgo
    }

    static cacheLatestMovies(movies:any[]):void{
        db.withTransactionSync(()=>{
            db.runSync('DELETE FROM latest_movies')

            for(const movie of movies){
                db.runSync(
                    `INSERT INTO latest_movies
                    (tmdb_id,title,overview,poster_path,backdrop_path,vote_average,release_date,runtime)
                    VALUEs(?,?,?,?,?,?,?,?)`,
                    movie.id,
                    movie.title,
                    movie.overview || null,
                    movie.poster_path || null,
                    movie.backdrop_path || null,
                    movie.vote_average || null,
                    movie.release_date || null,
                    movie.runtime || null
                )
            }
        })

        console.log(`Cached ${movies.length} latest movies`)
    }

    static getLatestMovies():LatestMovie[]{
        const rows = db.getAllSync<any>('SELECT * FROM latest_movies')
        return rows.map(row=>({
            id: row.id,
            tmdbId: row.tmdb_id,
            title: row.title,
            overview: row.overview,
            posterPath: row.poster_path,
            backdropPath: row.backdrop_path,
            voteAverage: row.vote_average,
            releaseDate: row.release_date,
            runtime: row.runtime,
            cachedAt: row.cached_at,
        }))
    }

    static shouldRefreshLatestMovies():boolean{
        const result = db.getFirstSync<any>('SELECT cached_at FROM latest_movies LIMIT 1')

        if(!result) return true


        const twelveHrsAgo = Math.floor((Date.now()/1000)-(12*60*60))

        return result.cached_at<twelveHrsAgo
    }

    static cacheLatestTvShows(shows:any[]):void{
        db.withTransactionSync(()=>{
            db.runSync('DELETE FROM latest_tv_shows')
            
            for(const show of shows){
            db.runSync(
                `INSERT INTO latest_tv_shows 
                (tmdb_id,name,overview,poster_path,backdrop_path,vote_average,first_air_date,number_of_seasons)
                VALUES(?,?,?,?,?,?,?,?)`,
                show.id,
                show.name,
                show.overview || null,
                show.poster_path || null,
                show.backdrop_path || null,
                show.vote_average || null,
                show.first_air_date || null,
                show.number_of_seasons || null
            )}
        })

        console.log(`Cached ${shows.length} latest TV Shows`)
    }

    static getLatestTvShows():LatestTvShow[]{
        const rows = db.getAllSync<any>('SELECT * FROM latest_tv_shows')

        return rows.map(row=>({
            id: row.id,
            tmdbId: row.tmdb_id,
            name: row.name,
            overview: row.overview,
            posterPath: row.poster_path,
            backdropPath: row.backdrop_path,
            voteAverage: row.vote_average,
            firstAirDate: row.first_air_date,
            numberOfSeasons: row.number_of_seasons,
            cachedAt: row.cached_at,
        }))
    }

    static shouldRefreshLatestTvShows():boolean{
        const result = db.getFirstSync<any>(
            'SELECT cached_at FROM latest_tv_shows LIMIT 1'
        )
         
        if(!result) return true

        const twelveHrsAgo = Math.floor((Date.now()/1000)-(12*60*60))

        return result.cached_at<twelveHrsAgo
    }

    static cacheDetails(tmdbId:number, type:'movie'|'tv',data:any):void{
        const jsonData = JSON.stringify(data)

        db.runSync(
            `INSERT OR REPLACE INTO content_details
            (tmdb_id,type,data,cached_at)
            VALUEs(?,?,?,strftime('%s','now'))`,
            tmdbId,
            type,
            jsonData
        )

        console.log(`Cached ${type} details for TMDBID: ${tmdbId}`)
    }

    static getDetails(tmdbId:number,type:'movie'|'tv'):any | null{
        const results = db.getFirstSync<any>(
            'SELECT data, cached_at FROM content_details WHERE tmdb_id=? AND type =?',
            tmdbId,
            type
        )
        if(!results) return null
        return JSON.parse(results.data)
    }

    static shouldRefreshDetails(tmdbId:number,type:'movie'|'tv'):boolean{
        const result = db.getFirstSync<any>(
            'SELECT cached_at FROM content_details WHERE tmdb_id=? AND type=? LIMIT 1',
            tmdbId,
            type
        )
        if(!result) return true

        const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
        return result.cached_at < sevenDaysAgo;
    }

    static addToWatchlist(item:{
            tmdbId:number,
            type:'movie'|'tv',
            title:string,
            posterPath?: string | null
        }):boolean {
            try {
                db.runSync(
                    `INSERT INTO watchlist
                    (tmdb_id,type,title,poster_path)
                    VALUEs(?,?,?,?)`,
                    item.tmdbId,
                    item.type,
                    item.title,
                    item.posterPath || null
                )

                console.log((`Added to watchlist: ${item.tmdbId}`))
                return true
                
            } catch (error:any) {
                if (error.message?.includes('UNIQUE constraint')) {
                    console.log(`Already in watchlist: ${item.title}`);
                    return false;
                }
                return false
            }
        }

        static removeFromWatchlist(tmdbId: number): void {
            const result = db.runSync(
            'DELETE FROM watchlist WHERE tmdb_id = ?',
            tmdbId
            );

            if (result.changes > 0) {
            console.log(`Removed from watchlist: TMDB ID ${tmdbId}`);
            }
        }

        static getWatchlist(): WatchListItem[] {
            const rows = db.getAllSync<any>(
            'SELECT * FROM watchlist ORDER BY added_at DESC'
            );

            return rows.map(row => ({
            id: row.id,
            tmdbId: row.tmdb_id,
            type: row.type,
            title: row.title,
            posterPath: row.poster_path,
            addedAt: row.added_at,
            }));
        }

        static isInWatchlist(tmdbId: number): boolean {
            const result = db.getFirstSync<any>(
            'SELECT EXISTS(SELECT 1 FROM watchlist WHERE tmdb_id = ?) as found',
            tmdbId
            )

            return result?.exists === 1
        }

        static getWatchlistCount(): number {
            const result = db.getFirstSync<any>(
            'SELECT COUNT(*) as count FROM watchlist'
            );

            return result?.count || 0;
        }

        static clearWatchlist(): void {
            db.runSync('DELETE FROM watchlist')
            console.log('Watchlist cleared')
        }

        static addToHistory(item: {
        tmdbId: number
        type: 'movie' | 'tv'
        title: string
        posterPath?: string | null
        seasonNumber?: number
        episodeNumber?: number
        episodeTitle?: string
    }): void {
        if (item.type === 'tv' && item.seasonNumber && item.episodeNumber) {
        const existing = db.getFirstSync<any>(
            `SELECT id FROM watch_history 
            WHERE tmdb_id = ? AND season_number = ? AND episode_number = ?`,
            item.tmdbId,
            item.seasonNumber,
            item.episodeNumber
        );

        if (existing) {
            db.runSync(
            `UPDATE watch_history 
            SET last_watched_at = strftime('%s', 'now')
            WHERE id = ?`,
            existing.id
            );
            console.log(`Updated history: ${item.title} S${item.seasonNumber}E${item.episodeNumber}`);
            return;
        }
        } else {
        const existing = db.getFirstSync<any>(
            'SELECT id FROM watch_history WHERE tmdb_id = ? AND type = ?',
            item.tmdbId,
            item.type
        );

        if (existing) {
            db.runSync(
                `UPDATE watch_history 
                SET last_watched_at = strftime('%s', 'now')
                WHERE id = ?`,
                existing.id
            )
            console.log(`Updated history: ${item.title}`);
            return
        }
        }

        
        db.runSync(
        `INSERT INTO watch_history 
        (tmdb_id, type, title, poster_path, season_number, episode_number, episode_title)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
            item.tmdbId,
            item.type,
            item.title,
            item.posterPath || null,
            item.seasonNumber || null,
            item.episodeNumber || null,
            item.episodeTitle || null
        )

        console.log(`Added to history: ${item.title}`)
    }

    static getHistory(limit: number = 20): WatchHistoryItem[] {
        const rows = db.getAllSync<any>(
        'SELECT * FROM watch_history ORDER BY last_watched_at DESC LIMIT ?',
        limit
        )

        return rows.map(row => ({
        id: row.id,
        tmdbId: row.tmdb_id,
        type: row.type,
        title: row.title,
        posterPath: row.poster_path,
        seasonNumber: row.season_number,
        episodeNumber: row.episode_number,
        episodeTitle: row.episode_title,
        lastWatchedAt: row.last_watched_at,
        }))
    }

    static clearHistory(): void {
        db.runSync('DELETE FROM watch_history')
        console.log('Watch history cleared')
    }

    static removeFromHistory(id: number): void {
        db.runSync('DELETE FROM watch_history WHERE id = ?', id);
        console.log(`Removed from history: ID ${id}`);
    }

    static clearAllCaches(): void {
        db.withTransactionSync(() => {
        db.runSync('DELETE FROM trending_movies')
        db.runSync('DELETE FROM latest_movies')
        db.runSync('DELETE FROM latest_tv_shows')
        db.runSync('DELETE FROM content_details')
        });

        console.log('All caches cleared')
    }

    static clearAllData(): void {
        db.withTransactionSync(() => {
        db.runSync('DELETE FROM trending_movies')
        db.runSync('DELETE FROM latest_movies')
        db.runSync('DELETE FROM latest_tv_shows')
        db.runSync('DELETE FROM content_details')
        db.runSync('DELETE FROM watchlist')
        db.runSync('DELETE FROM watch_history')
        });

        console.log('All data cleared')
    }

    static getStats() {
        const tables = {
        trending: db.getFirstSync<any>('SELECT COUNT(*) as count FROM trending_movies'),
        movies: db.getFirstSync<any>('SELECT COUNT(*) as count FROM latest_movies'),
        shows: db.getFirstSync<any>('SELECT COUNT(*) as count FROM latest_tv_shows'),
        details: db.getFirstSync<any>('SELECT COUNT(*) as count FROM content_details'),
        watchlist: db.getFirstSync<any>('SELECT COUNT(*) as count FROM watchlist'),
        history: db.getFirstSync<any>('SELECT COUNT(*) as count FROM watch_history'),
        };

        return {
        trendingCount: tables.trending?.count || 0,
        moviesCount: tables.movies?.count || 0,
        showsCount: tables.shows?.count || 0,
        detailsCount: tables.details?.count || 0,
        watchlistCount: tables.watchlist?.count || 0,
        historyCount: tables.history?.count || 0,
        };
    }

    static getDatabaseSize(): number {
        const stats = this.getStats()
        const totalRows = Object.values(stats).reduce((sum, count) => sum + count, 0)
        return Math.round(totalRows * 2) // Estimate: 2KB per row
    }
}







