import { borderRadius, cardSizes, colors, shadows, spacing, typography } from "@/constants/theme"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { Star } from 'lucide-react-native'
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface MovieCardProps{
    tmdbId: number
    title: string
    posterPath: string | null
    type: 'movie' | 'tv'
    voteAverage?: number | null
    size?: 'default' | 'large'
}

export default function MovieCard({
    tmdbId,
    title,
    posterPath,
    type,
    voteAverage,
    size = 'default'
}:MovieCardProps){
    const router = useRouter()

    const handlePress = () =>{
        router.push({
            pathname:'/details/[type]/[id]',
            params:{
                type:type,
                id:tmdbId
            }
        }) 
    }

    const getPosterUrl  = ()=>{
        if(!posterPath) return null
        return `https://image.tmdb.org/t/p/w342${posterPath}`
    }

    const cardWidth = size === 'large' ? cardSizes.posterLarge.width : cardSizes.poster.width
    const cardHeight = size === 'large' ? cardSizes.posterLarge.height : cardSizes.poster.height

    return (
        <TouchableOpacity 
        activeOpacity={0.7}
        onPress={handlePress}
        style={[styles.container,{width:cardWidth}]}>
            <View style={[styles.posterContainer,{width:cardWidth,height:cardHeight}]}>
                {posterPath ? (
                    <Image
                    source={{uri:getPosterUrl()!}}
                    style={styles.poster}
                    contentFit="cover"/>
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )
                }

                {voteAverage && voteAverage > 0 && (
                    <View style={styles.ratingBadge}>
                        <Star size={10} color={colors.accent} fill={colors.accent}/>
                        <Text style={styles.ratingText}>{voteAverage.toFixed(1)}</Text>
                    </View>
                )
                }
            </View>

            <Text style={styles.title} numberOfLines={2}>
                {title}
            </Text>

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container:{
        marginRight: spacing.sm
    },
    posterContainer:{
        borderRadius: borderRadius.md,
        overflow:'hidden',
        backgroundColor:colors.surface,
        ...shadows.medium
    },
    poster:{
        width:'100%',
        height:'100%'
    },
    placeholder:{
        width:'100%',
        height:'100%',
        backgroundColor:colors.surfaceLight,
        justifyContent:'center',
        alignItems:'center'
    },
    placeholderText:{
        color: colors.textSecondary,
        fontSize: typography.small.fontSize
    },
    ratingBadge:{
        position:'absolute',
        top:spacing.xs,
        right:spacing.xs,
        backgroundColor: colors.overlay,
        borderRadius:borderRadius.sm,
        paddingHorizontal:spacing.xs,
        paddingVertical:2,
        flexDirection:'row',
        alignItems:'center',
        gap:2
    },
    ratingText:{
       color:colors.text,
       fontSize:10,
       fontWeight:'600' 
    },
    title:{
        marginTop: spacing.xs,
        color: colors.text,
        fontSize:typography.caption.fontSize,
        fontWeight:'500',
        lineHeight:typography.caption.lineHeight
    }
})