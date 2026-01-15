import { borderRadius, colors, spacing, typography } from "@/constants/theme";
import { ContentService } from "@/services/content";
import { DatabaseService } from "@/services/database";
import { Image } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { Check, Play, Plus } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
const {width:SCREEN_WIDTH} = Dimensions.get('window')
const HERO_HEIGHT = 400

interface HeroMovie{
    tmdbId: number
    title:string
    overview: string | null
    backdropPath: string | null
    voteAverage: number | null
}

interface HeroCarouselProps{
    movies:HeroMovie[]
}

export default function HeroCarousel({movies}:HeroCarouselProps){
    const[currentIndex,setCurrentIndex] = useState(0)
    const[inWatchlist,setInWatchlist] = useState<Record<number,boolean>>({})
    const scrollViewRef = useRef<ScrollView>(null)
    const router = useRouter()

    useEffect(()=>{
        if(movies.length<=1) return

        const interval = setInterval(()=>{
            setCurrentIndex((prev)=>{
                const next = (prev+1) % movies.length
                scrollViewRef.current?.scrollTo({
                    x:next * SCREEN_WIDTH,
                    animated:true
                })
                return next
            })
        },5000)

        return ()=> clearInterval(interval)

    },[movies.length])

    useEffect(()=>{
        const watchlistStatus: Record<number,boolean> = {}
        movies.forEach((movie)=>{
            watchlistStatus[movie.tmdbId] = DatabaseService.isInWatchlist(movie.tmdbId)
        })
        setInWatchlist(watchlistStatus)
    },[movies])

    const handleScroll = (event:any)=>{
        const offsetX = event.nativeEvent.contentOffset.x
        const index = Math.round(offsetX/SCREEN_WIDTH)
        setCurrentIndex(index)
    }

    const handlePlayPress = (movie:HeroMovie) =>{
        const embedUrl = ContentService.getEmbedUrl(movie.tmdbId,'movie')
        router.push({
            pathname:'/player',
            params:{
                url:embedUrl
            }
        })
    }

    const handleWatchlistPress = (movie:HeroMovie) =>{
        if(inWatchlist[movie.tmdbId]){
            DatabaseService.removeFromWatchlist(movie.tmdbId)
            setInWatchlist({...inWatchlist,[movie.tmdbId]:false})
        } else{
            DatabaseService.addToWatchlist({
                tmdbId:movie.tmdbId,
                type:'movie',
                title:movie.title,
                posterPath:movie.backdropPath
            })
            setInWatchlist({...inWatchlist,[movie.tmdbId]:true})
        }
    }

    if(movies.length === 0){
        return null
    }

    return(
        <View style={styles.container}>
            <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}>
                {movies.map((movie)=>(
                    <View key={movie.tmdbId} style={styles.slide}>
                        {movie.backdropPath ? (
                            <Image
                                source={{
                                    uri:`https://image.tmdb.org/t/p/w780${movie.backdropPath}`}}
                                style={styles.backdrop}
                                contentFit= 'cover'
                            />
                        ):(
                            <View style={styles.backdropPlaceholder}/>
                        )}
                        <LinearGradient 
                        colors={[
                            'rgba(20, 20, 20, 0)',
                            'rgba(20, 20, 20, 0.3)',
                            'rgba(20, 20, 20, 0.8)',
                            'rgba(20, 20, 20, 1)',
                        ]}
                        style={styles.gradient}/>
                        <View style={styles.content}>
                            <Text 
                            style={styles.title} 
                            numberOfLines={2}>
                                {movie.title}
                            </Text>
                            {movie.overview && (
                                <Text style={styles.overview} 
                                numberOfLines={3}>
                                    {movie.overview}
                                </Text>
                            )}
                            <View style={styles.actions}>
                                <TouchableOpacity 
                                style={styles.playButton}
                                onPress={()=>handlePlayPress(movie)}
                                activeOpacity={0.8}>
                                    <Play size={20} color={colors.text} fill={colors.text}/>
                                    <Text style={styles.playButtonText}>Play</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                style={styles.watchlistButton}
                                onPress={()=>handleWatchlistPress(movie)}
                                activeOpacity={0.8} >
                                    {inWatchlist[movie.tmdbId] ? (
                                        <Check size={20} color={colors.text}/>
                                    ):(
                                        <Plus size={20} color={colors.text}/>
                                    )}
                                    <Text style={styles.watchlistButtonText}>
                                        {inWatchlist[movie.tmdbId]?'Added':'Watchlist'}
                                    </Text>

                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
            {movies.length > 1 && (
                <View style={styles.pagination}>
                    {movies.map((_,index)=>(
                        <View
                        key={index}
                        style={[
                            styles.dot,
                            index === currentIndex && styles.dotActive
                        ]}/>
                    ))

                    }
                </View>
            )

            }
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        height:HERO_HEIGHT,
        marginBottom:spacing.lg
    },
    slide:{
        width:SCREEN_WIDTH,
        height:HERO_HEIGHT
    },
    backdrop:{
        width:'100%',
        height:'100%'
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
        height:HERO_HEIGHT
    },
    content:{
        position:'absolute',
        bottom: 0,
        left: 0,
        right:0,
        padding:spacing.md
    },
    title:{
        color:colors.text,
        fontSize:typography.hero.fontSize,
        fontWeight:typography.hero.fontWeight,
        marginBottom:spacing.sm
    },
    overview:{
        color:colors.textSecondary,
        fontSize:typography.caption.fontSize,
        lineHeight:typography.caption.lineHeight,
        marginBottom:spacing.md
    },
    actions:{
        flexDirection:'row',
        gap:spacing.sm
    },
    playButton: {
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
        borderRadius:borderRadius.sm,
        gap:spacing.xs
    },
    watchlistButtonText:{
        color:colors.text,
        fontSize:typography.body.fontSize,
        fontWeight:'600'
    },
    pagination:{
        position:'absolute',
        bottom:3.5,
        left:0,
        right:0,
        flexDirection:'row',
        justifyContent:'center',
        gap:spacing.xs
    },
    dot:{
        width:6,
        height:6,
        borderRadius:3,
        backgroundColor:colors.textSecondary,
        opacity:0.5
    },
    dotActive:{
        backgroundColor:colors.primary,
        opacity:1
    }
})
