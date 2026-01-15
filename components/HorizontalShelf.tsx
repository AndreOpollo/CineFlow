import { colors, spacing, typography } from "@/constants/theme"
import { ChevronRight } from "lucide-react-native"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import MovieCard from "./MovieCard"

interface ShelfItem {
    tmdbId: number
    title?: string
    name?: string
    posterPath: string | null
    voteAverage?: number | null
}

interface HorizontalShelfProps {
    title: string
    items: ShelfItem[]
    type: 'movie' | 'tv'
    onSeeAll?: () => void
}

export default function HorizontalShelf({
    title,
    items,
    type,
    onSeeAll
}:HorizontalShelfProps){
    if(items.length === 0){
        return null
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {onSeeAll && (
                    <TouchableOpacity 
                    onPress={onSeeAll}
                    style={styles.seeAllButton}
                    activeOpacity={0.7}>
                        <Text style={styles.seeAllText}>See All</Text>
                        <ChevronRight size={16} color={colors.textSecondary}/>
                    </TouchableOpacity>
                )}
            </View>
            <ScrollView 
            horizontal
            showsHorizontalScrollIndicator = {false}
            contentContainerStyle = {styles.scrollContent}
            snapToInterval={110 + spacing.sm}
            decelerationRate={'fast'}>
                {items.map((item)=>(
                    <MovieCard 
                    key={item.tmdbId}
                    tmdbId={item.tmdbId} 
                    title={item.title||item.name||'Untitled' } 
                    posterPath={item.posterPath} 
                    type={type}
                    voteAverage={item.voteAverage}/>
                ))

                }

            </ScrollView>
        </View>
    )

}

const styles = StyleSheet.create({
    container:{
        marginBottom: spacing.lg
    },
    header:{
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingHorizontal:spacing.md,
        marginBottom:spacing.sm
    },
    title:{
        color:colors.text,
        fontSize:typography.h3.fontSize,
        fontWeight:typography.h3.fontWeight
    },
    seeAllButton:{
        flexDirection:'row',
        alignItems:'center',
        gap:4
    },
    seeAllText:{
        color:colors.textSecondary,
        fontSize: typography.caption.fontSize
    },
    scrollContent:{
        paddingLeft: spacing.md,
        paddingRight: spacing.sm
    }
})