import HorizontalShelf from "@/components/HorizontalShelf";
import { borderRadius, colors, spacing, typography } from "@/constants/theme";
import { ContentService } from "@/services/content";
import { DatabaseService } from "@/services/database";
import { TMDBService } from "@/services/tmdb";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Check, Clock, Play, Plus, Star } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from 'react-native-webview';

const {width:SCREEN_WIDTH} = Dimensions.get('window')
const BACKDROP_HEIGHT = 250

export default function DetailsScreen(){
    const{type,id} = useLocalSearchParams<{type:string,id:string}>()
    const router = useRouter()

    const[content,setContent] = useState<any>(null)
    const[loading,setLoading]=useState(true)
    const[inWatchlist,setInWatchlist]=useState(false)
    const[showTrailer,setShowTrailer]=useState(false)
    const trailerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const isMovie = type === 'movie'
    const tmdbId = parseInt(id)

    useEffect(()=>{
        loadContent()
        checkWatchlistStatus()

    },[id,type])


    async function loadContent(){
        try {
            setLoading(true)

            const cached = DatabaseService.getDetails(tmdbId,type as 'movie'| 'tv')
            if(cached){
                setContent(cached)
                setLoading(false)
            }

            const shouldRefresh = DatabaseService.shouldRefreshDetails(tmdbId,type as 'movie'| 'tv')

            if(shouldRefresh || !cached){
                const fresh = isMovie ? await TMDBService.getMovieDetails(tmdbId): await TMDBService.getTvDetails(tmdbId)

                if(fresh){
                    DatabaseService.cacheDetails(tmdbId,type as 'movie'| 'tv',fresh)
                    setContent(fresh)
                }
            }
            setLoading(false)
        } catch (error) {
            console.error('Error loading content',error)
            setLoading(false)
            
        }
    }

    function checkWatchlistStatus(){
        setInWatchlist(DatabaseService.isInWatchlist(tmdbId))
    }
    function getTrailerKey():string| null{
        if(!content?.videos?.results) return null

        const trailer = content.videos.results.find(
            (video:any)=>
                video.type === 'Trailer' && 
                video.site === 'YouTube' &&
                video.key
        )
        return trailer?.key || null
    }

    function handleTrailerPress(){
        const trailerKey = getTrailerKey()
        if(trailerKey){
            Linking.openURL(`https://www.youtube.com/watch?v=${trailerKey}`)
        }
    }

    function toggleWatchlist(){
        if(inWatchlist){
            DatabaseService.removeFromWatchlist(tmdbId)
            setInWatchlist(false)
        } else{
            DatabaseService.addToWatchlist({
                tmdbId,
                type: type as 'movie'| 'tv',
                title:isMovie?content.title : content.name,
                posterPath:content.poster_path
            })

            setInWatchlist(true)
        }
    }

    function handlePlayPress(){
        DatabaseService.addToHistory({
            tmdbId,
            type:type as 'movie'| 'tv',
            title: isMovie? content.title: content.name,
            posterPath:content.poster_path
        })

        if(isMovie){
            const embedUrl = ContentService.getEmbedUrl(tmdbId, 'movie');
        router.push({
        pathname: '/player',
        params: { url: embedUrl }
        });
        } else {
            const embedUrl = ContentService.getEmbedUrl(tmdbId, 'tv', 1, 1);
       router.push({
      pathname: '/player',
      params: { url: embedUrl }
    });
      }
    }   


    if(loading && !content){
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={'large'} color={colors.primary}/>
            </View>
        )
    }

    if(!content){
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Content not found</Text>
            </View>
        )
    }

    const title = isMovie ? content.title : content.name
    const releaseDate = isMovie ? content.release_date : content.first_air_date;
    const backdropUrl = content.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${content.backdrop_path}`
        : null
    const trailerKey = getTrailerKey()

    return(
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.backdropContainer}>
                    {!showTrailer || !trailerKey ?(
                        <>
                        {backdropUrl?(
                            <Image 
                            source={{uri:backdropUrl}} 
                            style={styles.backdrop}/>
                        ):(
                            <View style={styles.backdropPlaceholder}/>
                        )}
                        </>
                    ):(
                        <WebView 
                        source={{uri:`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}}
                        style={styles.trailer}
                        allowsFullscreenVideo={false}
                        mediaPlaybackRequiresUserAction={false}
                        javaScriptEnabled
                        scrollEnabled={false}/>
                    )}

                    <LinearGradient
                        colors={[
                        'rgba(20, 20, 20, 0)',
                        'rgba(20, 20, 20, 0.7)',
                        'rgba(20, 20, 20, 1)',
                        ]}
                        style={styles.gradient}
                    />
                    {trailerKey && (
                            <TouchableOpacity
                            style={styles.trailerButton}
                            onPress={handleTrailerPress}
                            activeOpacity={0.8}
                            >
                            <View style={styles.trailerButtonInner}>
                                <Play size={28} color={colors.text} fill={colors.text} />
                            </View>
                            <Text style={styles.trailerButtonText}>Watch Trailer</Text>
                            </TouchableOpacity>
                        )}
                    <TouchableOpacity 
                    style={styles.backButton}
                    onPress={()=>router.back()}
                    activeOpacity={0.8}>
                        <ArrowLeft size={24} color={colors.text}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.content}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                        {content.vote_average>0 && (
                            <View style={styles.ratingBadge}>
                                <Star size={16} color={colors.accent} fill={colors.accent}/>
                                <Text style={styles.ratingText}>
                                    {content.vote_average.toFixed(1)}
                                </Text>

                            </View>
                        )}
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity 
                        style={styles.playButton}
                        onPress={handlePlayPress}
                        activeOpacity={0.8}>
                            <Play size={20} color={colors.text} fill={colors.text}/>
                            <Text style={styles.playButtonText}>Play</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                        style={styles.watchlistButton}
                        onPress={toggleWatchlist}
                        activeOpacity={0.8}>
                            {inWatchlist?(
                                <Check size={20} color={colors.text}/>
                            ):(
                                <Plus size={20} color={colors.text}/>
                            )}
                            <Text style={styles.watchlistButtonText}>
                                {inWatchlist? 'In Watchlist':'Add To Watchlist'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.metadata}>
                        {releaseDate && (
                            <View style={styles.metadataItem}>
                                <Calendar size={16} color={colors.textSecondary}/>
                                <Text style={styles.metadataText}>
                                    {new Date(releaseDate).getFullYear()}
                                </Text>
                            </View>
                        )}
                        {isMovie && content.runtime && (
                            <View style={styles.metadataItem}>
                                <Clock size={16} color={colors.textSecondary}/>
                                <Text style={styles.metadataText}>{content.runtime} min</Text>
                            </View>
                        )}
                        {!isMovie && content.number_of_seasons && (
                            <View style={styles.metadataItem}>
                                <Text style={styles.metadataText}>
            {`${content.number_of_seasons} Season${content.number_of_seasons !== 1 ? 's' : ''}`}
                                </Text>
                            </View>
                        )}
                    </View>
                    {content.overview && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Overview</Text>
                            <Text style={styles.overview}>{content.overview}</Text>
                        </View>
                    )}

                    {content.genres && content.genres.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Genres</Text>
                            <View style={styles.genres}>
                                {content.genres.map((genre:any)=>(
                                    <View key={genre.id}style={styles.genreTag}>
                                        <Text style={styles.genreText}>{genre.name}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {content.credits?.cast && content.credits.cast.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Cast</Text>
                            <ScrollView 
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.castScrollContent}>
                                 {content.credits.cast.slice(0, 10).map((actor: any) => (
                                <View key={actor.id} style={styles.castItem}>
                                    {actor.profile_path ? (
                                    <Image
                                        source={{
                                        uri: `https://image.tmdb.org/t/p/w185${actor.profile_path}`,
                                        }}
                                        style={styles.castImage}
                                    />
                                    ) : (
                                    <View style={styles.castImagePlaceholder}>
                                        <Text style={styles.castInitial}>
                                        {actor.name.charAt(0)}
                                        </Text>
                                    </View>
                                    )}
                                    <Text style={styles.castName} numberOfLines={2}>
                                    {actor.name}
                                    </Text>
                                    <Text style={styles.castCharacter} numberOfLines={1}>
                                    {actor.character}
                                    </Text>
                                </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                    {!isMovie && content.seasons && content.seasons.length > 0 && (
                        <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Seasons</Text>
                        {content.seasons
                            .filter((season: any) => season.season_number > 0)
                            .map((season: any) => (
                            <TouchableOpacity
                                key={season.season_number}
                                style={styles.seasonItem}
                                activeOpacity={0.7}
                            >
                                {season.poster_path ? (
                                <Image
                                    source={{
                                    uri: `https://image.tmdb.org/t/p/w154${season.poster_path}`,
                                    }}
                                    style={styles.seasonPoster}
                                />
                                ) : (
                                <View style={styles.seasonPosterPlaceholder} />
                                )}
                                <View style={styles.seasonInfo}>
                                <Text style={styles.seasonName}>{season.name}</Text>
                                <Text style={styles.seasonEpisodes}>
                                    {season.episode_count} Episodes
                                </Text>
                                </View>
                            </TouchableOpacity>
                            ))}
                        </View>
                    )}

                {content.similar?.results && content.similar.results.length > 0 && (
                    <View style={styles.section}>
                    <HorizontalShelf
                        title={`Similar ${isMovie ? 'Movies' : 'TV Shows'}`}
                        items={content.similar.results.map((item: any) => ({
                        tmdbId: item.id,
                        title: item.title || item.name,
                        posterPath: item.poster_path,
                        voteAverage: item.vote_average,
                        }))}
                        type={type as 'movie' | 'tv'}
                    />
                    </View>
                )}
                <View style={styles.bottomSpacer}/>
                </View>
            </ScrollView>
        </SafeAreaView>
    )

}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:colors.background
    },
    loadingContainer:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:colors.background
    },
    errorText:{
        color:colors.error,
        fontSize:typography.h3.fontSize
    },
    scrollView:{
        flex:1
    },
    backdropContainer:{
        height:BACKDROP_HEIGHT,
        width:'100%'
    },
    backdrop:{
        width:'100%',
        height:'100%'
    },
    trailer:{
        width:'100%',
        height:'100%',
        backgroundColor:colors.background
    },
    backdropPlaceholder:{
        width:'100%',
        height:'100%',
        backgroundColor:colors.surface
    },
    gradient:{
        position:'absolute',
        left:0,
        right:0,
        bottom:0,
        height:BACKDROP_HEIGHT
    },
    backButton:{
        position:'absolute',
        top:spacing.md,
        left:spacing.md,
        width:40,
        height:40,
        borderRadius:20,
        backgroundColor: colors.overlay,
        justifyContent:'center',
        alignItems:'center'
    },
    content:{
        padding:spacing.md
    },
    titleContainer:{
        flexDirection:'row',
        alignItems:'flex-start',
        justifyContent:'space-between',
        marginBottom:spacing.md
    },
    title:{
        flex:1,
        color:colors.text,
        fontSize:typography.h1.fontSize,
        fontWeight:typography.h1.fontWeight,
        marginRight:spacing.sm
    },
    ratingBadge:{
        flexDirection:'row',
        alignItems:'center',
        gap:4,
        backgroundColor:colors.surfaceLight,
        paddingHorizontal:spacing.sm,
        paddingVertical:spacing.xs,
        borderRadius:borderRadius.sm
    },
    ratingText:{
        color:colors.text,
        fontSize:typography.body.fontSize,
        fontWeight:'600'
    },
    actions:{
        flexDirection:'row',
        gap:spacing.sm,
        marginBottom:spacing.md
    },
    
    playButton:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:colors.primary,
        paddingVertical:spacing.sm + 2,
        borderRadius:borderRadius.sm,
        gap:spacing.xs
    },
    playButtonText:{
        color:colors.text,
        fontSize:typography.body.fontSize,
        fontWeight:'600'
    },
    watchlistButton:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:colors.surfaceLight,
        paddingVertical:spacing.sm + 2,
        gap:spacing.xs
    },
    watchlistButtonText:{
        color:colors.text,
        fontSize:typography.body.fontSize,
        fontWeight:'600'
    },
    metadata:{
        flexDirection:'row',
        flexWrap:'wrap',
        gap:spacing.md,
        marginBottom:spacing.lg
    },
    metadataItem:{
        flexDirection:'row',
        alignItems:'center',
        gap:spacing.xs
    },
    metadataText:{
        color:colors.textSecondary,
        fontSize:typography.caption.fontSize
    },
    section:{
        marginBottom:spacing.lg
    },
    sectionTitle:{
        color:colors.text,
        fontSize:typography.h3.fontSize,
        fontWeight:typography.h3.fontWeight,
        marginBottom:spacing.sm
    },
    overview:{
        color:colors.textSecondary,
        fontSize:typography.body.fontSize,
        lineHeight:typography.body.lineHeight
    },
    genres:{
        flexDirection:'row',
        flexWrap:'wrap',
        gap:spacing.xs
    },
    genreTag:{
        backgroundColor: colors.surfaceLight,
        paddingHorizontal:spacing.sm,
        paddingVertical:spacing.xs,
        borderRadius:borderRadius.sm
    },
    genreText:{
        color:colors.text,
        fontSize: typography.caption.fontSize
    },
    castScrollContent: {
    paddingRight: spacing.md,
    },
    castItem: {
        width: 80,
        marginRight: spacing.sm,
    },
    castImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.surface,
    },
    castImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    castInitial: {
        color: colors.text,
        fontSize: typography.h2.fontSize,
        fontWeight: '600',
    },
    castName: {
        marginTop: spacing.xs,
        color: colors.text,
        fontSize: typography.small.fontSize,
        fontWeight: '500',
        textAlign: 'center',
    },
    castCharacter: {
        color: colors.textSecondary,
        fontSize: typography.small.fontSize,
        textAlign: 'center',
    },
    seasonItem: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    seasonPoster: {
        width: 60,
        height: 90,
        backgroundColor: colors.surfaceLight,
    },
    seasonPosterPlaceholder: {
        width: 60,
        height: 90,
        backgroundColor: colors.surfaceLight,
    },
    seasonInfo: {
        flex: 1,
        padding: spacing.sm,
        justifyContent: 'center',
    },
    seasonName: {
        color: colors.text,
        fontSize: typography.body.fontSize,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    seasonEpisodes: {
        color: colors.textSecondary,
        fontSize: typography.caption.fontSize,
    },
    bottomSpacer: {
        height: spacing.xl,
    },
    trailerButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        },
trailerButtonInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.text,
        },
trailerButtonText: {
    color: colors.text,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    textShadowColor: colors.background,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    },
})