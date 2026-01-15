export interface VidSrcMovie{
    imdb_id:string
    tmdb_id:string
    title:string
    embed_url:string
    embed_url_tmdb:string
}

export interface VidSrcTvShow{
    imdb_id:string
    tmdb_id:string
    title:string
    embed_url:string
    embed_url_tmdb:string
}

export interface VidSrcResponse<T>{
    result: T[]
}

export class VidSrcService{
    private static readonly BASE_URL = 'https://vidsrc-embed.ru'

    static async getLatestMovies(page: number = 1):Promise<VidSrcMovie[]>{
        try {
            const response = await fetch(
                `${this.BASE_URL}/movies/latest/page-${page}.json`)
            
            if(!response.ok){
                throw new Error(`VidSrc Api Error: ${response.status}`);
            }

            const data: VidSrcResponse<VidSrcMovie> = await response.json()
            return data.result || []
        } catch (error) {
            console.error(`Error Fetching VidSrc Movies: ${error}`)
            return []
        }
    }

    static async getLatestTvShows(page:number = 1):Promise<VidSrcTvShow[]>{
        try {
            const response = await fetch(
                `${this.BASE_URL}/tvshows/latest/page-${page}.json`)
            
            if(!response.ok){
                throw new Error(`VidSrc Api Error: ${response.status}`)
            }

            const data: VidSrcResponse<VidSrcTvShow> = await response.json()

            return data.result || []
            
        } catch (error) {
            console.error(`Error Fetching VidSrc Tv Shows: ${error}`)
            return []            
        }
    }

    static getMovieEmbedUrl(tmdbId:number):string{
        return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`
    }

    static getTvEmbedUrl(tmdbId:number,season:number,episode:number):string{
        return `https://vidsrc.me/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`
    }

    static extractTmdbIds(items:(VidSrcMovie|VidSrcTvShow)[]):number[]{
        return items.map(item=>parseInt(item.tmdb_id)).filter(id=> !isNaN(id))
    }
}

