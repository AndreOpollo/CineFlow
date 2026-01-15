import { DatabaseService } from "./database";
import { TMDBMovie, TMDBService, TMDBTvShow } from "./tmdb";
import { VidSrcService } from "./vidsrc";

export interface EnrichedMovie extends Partial<TMDBMovie>{
    tmdbId:number
    embedUrl:string
}

export interface EnrichedTvShow extends Partial<TMDBTvShow>{
    tmdbId:number
    embedUrl:string
}

export class ContentService{
    static async fetchLatestMovies(page:number = 1):Promise<void>{
        try {
            console.log("Fetching Movies from Vidsrc...")
            
            const vidsrcMovies = await VidSrcService.getLatestMovies(page)

            if(vidsrcMovies.length===0){
                console.warn("No Movies found")
                return
            }

            console.log(`Found ${vidsrcMovies.length} latest vidsrc movies`)

            const tmdbIds = VidSrcService.extractTmdbIds(vidsrcMovies)

            console.log('Fetchung from TMDB Movies...')

            const tmdbMovies = await TMDBService.getMoviesByIds(tmdbIds)

            console.log(`Found ${tmdbMovies.length} movies from TMDB`)
            
            DatabaseService.cacheLatestMovies(tmdbMovies)

            console.log("Cached to Local Database")
        } catch (error) {
            console.error('Error fetching latest movies',error)
            throw error   
        }
    }

    static async fetchLatestTvShows(page:number = 1):Promise<void>{
        try {
            console.log('Fetching latest Tv Shows...')

            const vidsrcShows = await VidSrcService.getLatestTvShows(page)

            if(vidsrcShows.length===0){
                console.warn("No TV Shows found on vidsrc")
                return
            }
            
            console.log(`Found ${vidsrcShows.length} shows on vidsrc`)
            const tmdbIds = VidSrcService.extractTmdbIds(vidsrcShows)

            console.log('Fetching shows from tmdb')

            const tmdbShows = await TMDBService.getTvShowsById(tmdbIds)

            console.log(`Retrieved ${tmdbShows.length} tv shows from TMDB`)

            DatabaseService.cacheLatestTvShows(tmdbShows)

            console.log("Cache Successfully to Local DB")

        } catch (error) {
            console.error('Error fetching latest TV Show',error)
            throw error
            
        }
    }

    static async fetchTrending():Promise<void>{
        try {
            console.log('Fetching trending movies from TMDB...')

            const trending = await TMDBService.getTrending()

            if(trending.length===0){
                console.warn("No trending movies found on TMDB")
                return
            }
            console.log(`Found ${trending.length} movies on TMDB`)

            DatabaseService.cacheTrending(trending)
            console.log('Cached Trending to Database')
        } catch (error) {
            console.error('Failed to load trending movies from TMDB',error)
            throw error
        }
    }

    static async refreshHomeContent(): Promise<void>{
        try {
            console.log("Refreshing home content...")

            await Promise.allSettled([
                this.fetchLatestMovies(),
                this.fetchTrending(),
                this.fetchLatestTvShows()
            ])

            console.log("Home content refreshed successfully")
        } catch (error) {
            console.error('Error refreshing home content',error)
            throw error
        }
    }

    static async smartRefresh():Promise<void>{
        const refreshPromises: Promise<void>[] = [] 

        if(DatabaseService.shouldRefreshTrending()){
            console.log('Trending is stale, refreshing...')
            refreshPromises.push(this.fetchTrending())
        }
        if(DatabaseService.shouldRefreshLatestMovies()){
            console.log('Latest Movies is stale, refreshing...')
            refreshPromises.push(this.fetchLatestMovies())
        }
        if(DatabaseService.shouldRefreshLatestTvShows()){
            console.log('Latest TV Shows is stale, refreshing...')
            refreshPromises.push(this.fetchLatestTvShows())
        }
        if(refreshPromises.length === 0){
            console.log('All content is up to date')
            return
        }
        await Promise.allSettled(refreshPromises)
        console.log('Smart Refresh completed')
    }

    static getEmbedUrl(
        tmdbId:number,
        type:'movie'|'tv',
        season?:number,
        episode?:number):string{
            if(type === 'movie'){
                return VidSrcService.getMovieEmbedUrl(tmdbId)
            } else {
                if(!season||!episode){
                    throw new Error('Season and episode required for tv shows')
                }
                return VidSrcService.getTvEmbedUrl(tmdbId,season,episode)
            }
        
    }
}