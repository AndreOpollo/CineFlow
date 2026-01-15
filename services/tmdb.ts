
const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || '2e8eab13cabe235f418cab826566cdc9'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export interface TMDBMovie{
    id: number
    title:string
    overview:string
    poster_path:string | null 
    backdrop_path:string | null 
    vote_average:number
    release_date:string
    runtime?:number
    genres?:Array<{id:number,name:string}>
    credits?:{
        cast:Array<{
            id:number
            name:string
            character:string
            profile_path: string | null 
        }>
    }
    videos?:{
        results:Array<{
            key:string
            type:string
            site:string
        }>
    }
    similar?:{
        results:TMDBMovie[]
    }
}

export interface TMDBTvShow{
    id:number
    name:string
    overview:string
    poster_path:string | null 
    backdrop_path: string | null 
    vote_average: number
    first_air_date: string
    number_of_seasons:number
    number_of_episodes:number
    seasons?:Array<{
        season_number:number
        episode_count:number
        name:string
        poster_path:string | null 
    }>
    credits?:{
        cast:Array<{
            id:number
            name:string
            character:string
            profile_path:string | null 
        }>
    }
    videos?:{
        results:Array<{
            key:string
            type:string
            site:string
        }>
    }
    similar?:{
        results:TMDBTvShow[]
    }
}

export class TMDBService{
    static async getTrending(): Promise<TMDBMovie[]>{
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`)

            if(!response.ok){
                throw new Error(`TMDB Api Error: ${response.status}`)
            }

            const data = await response.json()
            return data.results || [] 
            
        } catch (error) {
            console.error(`Error fetching Trending Movies: ${error}`)
            return []
            
        }
    }

    static async getMoviesByIds(tmdbIds:number[]):Promise<TMDBMovie[]>{
        const movies: TMDBMovie[] = []

        const chunks = this.chunkArray(tmdbIds,5)
        for(const chunk of chunks){
            const promises = chunk.map(id=>this.getMovieDetails(id))
            const results = await Promise.allSettled(promises)

            results.forEach(result=>{
                if(result.status=='fulfilled' && result.value){
                    movies.push(result.value)
                }
            })

        }
        return movies
    }

    static async getTvShowsById(tmdbIds:number[]):Promise<TMDBTvShow[]>{
        const shows:TMDBTvShow[] = []

        const chunks  = this.chunkArray(tmdbIds,5)

        for(const chunk of chunks){
            const promises = chunk.map(id=>this.getTvDetails(id))
            const results = await Promise.allSettled(promises)

            results.forEach(result=>{
                if(result.status=='fulfilled' && result.value){
                    shows.push(result.value)
                }
            })

        }
        return shows
    }

    static async getMovieDetails(tmdbId:number):Promise<TMDBMovie|null>{
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar`)
            
            if(!response.ok){
                if(response.status==404){
                    console.warn(`Movie Not Found: ${tmdbId}`)
                    return null
                }
                throw new Error(`TMDB Api Error: ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            console.error(`Error fetching Movie: ${tmdbId}`,error)
            return null
         
        }

    }

    static async getTvDetails(tmdbId:number):Promise<TMDBTvShow|null>{
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar`)

            if(!response.ok){
                if(response.status==404){
                    console.warn(`TV Show Not Found: ${tmdbId}`)
                    return null
                }
                throw new Error(`TMDB Api Error: ${response.status}`)
            }
            return await response.json()
        } catch (error) {
            console.error(`Error fetching Tv Show: ${tmdbId}`,error)
            return null
        }
    }

    static async search(query:string):Promise<any[]>{
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`)

             if(!response.ok){
                throw new Error(`TMDB Api Error: ${response.status}`)
             }  
             const data = await response.json() 
             return data.results || []
        } catch (error) {
            console.error('Error Searching',error)
            return []
            
        }
    }
    static async getSeasonDetails(tmdbId:number,seasonNumber:number):Promise<any>{
        try {
            const response = await fetch(
                `${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`)

            if(!response.ok){
                throw new Error(`TMDB Api Error: ${response.status}`)
            }   
            return await response.json() 
        } catch (error) {
            console.error(`Error fetching Season Details: ${tmdbId}, season:${seasonNumber}`,error)
            return []
            
        }
    }

    static getImageUrl(path:string|null,size:'w200' | 'w500' | 'original' = 'w500'):string | null{
        if(!path) return null
        return `${TMDB_IMAGE_BASE}/${size}${path}`
    }

    static getYoutubeTrailer(movie:TMDBMovie| TMDBTvShow):string | null {
        const trailer = movie.videos?.results.find(video=>video.type==='Trailer' && video.site==='YouTube')
        if(!trailer) return null
        return `https://www.youtube.com/watch?v=${trailer.key}`
    }

    private static chunkArray<T>(array:T[],size:number):T[][]{
        const chunks: T[][] = []
        for(let i = 0; i<array.length; i+=size){
            chunks.push(array.slice(i,i+size))
        }
        return chunks
    }
}