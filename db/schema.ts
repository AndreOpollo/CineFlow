export interface TrendingMovie{
    id:number
    tmdbId:number
    title:string
    overview:string | null
    posterPath: string | null
    backdropPath: string | null
    voteAverage: number | null
    releaseDate: string | null
    cachedAt: number
}

export interface LatestMovie{
    id:number
    tmdbId:number
    title:string
    overview:string | null
    posterPath:string | null
    backdropPath: string | null
    voteAverage: number | null
    releaseDate: string | null 
    runtime: number | null
    cachedAt:number
}

export interface LatestTvShow{
    id:number
    tmdbId:number
    name:string
    overview:string | null
    posterPath:string | null
    backdropPath: string | null
    voteAverage: number | null
    firstAirDate: string | null
    numberOfSeasons: number | null
    cachedAt: number
}

export interface ContentDetails{
    id:number
    tmdbId:number
    type: 'movie'|'tv'
    data:string
    cachedAt:number
}

export interface WatchListItem{
    id:number
    tmdbId: number
    type:'movie'|'tv'
    title:string
    posterPath:string|null
    addedAt:number
}

export interface WatchHistoryItem{
    id:number
    tmdbId: number
    type: 'movie'|'tv'
    title:string
    posterPath: string | null
    seasonNumber: number | null
    episodeNumber: number | null
    episodeTitle: string | null,
    lastWatchedAt: number
}