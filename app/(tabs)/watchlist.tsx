import EmptyState from "@/components/EmptyState";
import MovieCard from "@/components/MovieCard";
import { colors, spacing, typography } from "@/constants/theme";
import { WatchListItem } from "@/db/schema";
import { DatabaseService } from "@/services/database";
import { useFocusEffect } from "expo-router";
import { Heart, Trash } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Watchlist(){
    const[watchlist,setWatchlist] = useState<WatchListItem[]>([])
    const[refreshing,setRefreshing] = useState(false)

    useFocusEffect(
        useCallback(()=>{
            loadWatchlist()
        },[])
    )

    function loadWatchlist(){
        const items = DatabaseService.getWatchlist()
        setWatchlist(items)
    }

    async function onRefresh(){
        setRefreshing(true)
        loadWatchlist()
        setRefreshing(false)
    }

    function handleRemove(tmdbId:number,title:string){
        Alert.alert(
            'Remove from Watchlist',
            `Remove "${title}" from your watchlist?`,
            [
                {text:'Cancel',style:'cancel'},
                {
                    text:'Remove',
                    style:'destructive',
                    onPress:()=>{
                        DatabaseService.removeFromWatchlist(tmdbId)
                        loadWatchlist()
                    }
                }
            ]
        )
    }

    function handleClearAll(){
        if(watchlist.length===0) return

        Alert.alert(
            'Clear Watchlist',
            'Remove all items from your watchlist?',
            [
                {text:'Cancel',style:'cancel'},
                {
                    text:'Clear All',
                    style:'destructive',
                    onPress:()=>{
                        DatabaseService.clearWatchlist()
                        loadWatchlist()
                    }
                }
            ]
        )
    }

    const renderItem = ({item}:any) =>(
        <View style={styles.cardWrapper}>
            <MovieCard 
            tmdbId={item.tmdbId} 
            title={item.title} 
            posterPath={item.posterPath} 
            type={item.type}
            />
            <TouchableOpacity 
            style={styles.removeButton}
            onPress={()=>handleRemove(item.tmdbId,item.title)}>
                <Trash size={16} color={colors.error}/>
            </TouchableOpacity>

        </View>
        
    )

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Watchlist</Text>
                {watchlist.length>0 && (
                    <TouchableOpacity 
                    style={styles.clearButton}
                    activeOpacity={0.7}
                    onPress={handleClearAll}>
                        <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>
            {watchlist.length>0 && (
                <Text style={styles.itemCount}>
                    {watchlist.length} {watchlist.length===1?'item':'items'}
                </Text>
            )}
            {watchlist.length === 0 ? (
                <EmptyState 
                icon={<Heart size={64} color={colors.textSecondary}/>}
                title={"Your watchlist is empty"} 
                message={"Add movies and TV shows you want to watch later"}/>
            ):(
                <FlatList
                data={watchlist}
                renderItem={renderItem}
                keyExtractor={(item)=>item.tmdbId.toString()}
                numColumns={3}
                contentContainerStyle={styles.grid}
                refreshing={refreshing}
                onRefresh={onRefresh}
                showsVerticalScrollIndicator={false}/>
            )}
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:colors.background
    },
    header:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingHorizontal:spacing.md,
        paddingVertical:spacing.sm
    },
    headerTitle:{
        color:colors.text,
        fontSize:typography.h1.fontSize,
        fontWeight:typography.h1.fontWeight
    },
    clearButton:{
        paddingHorizontal:spacing.sm,
        paddingVertical:spacing.xs
    },
    clearButtonText:{
        color:colors.error,
        fontSize:typography.caption.fontSize,
        fontWeight:'600'
    },
    itemCount:{
        color:colors.textSecondary,
        fontSize:typography.caption.fontSize,
        paddingHorizontal:spacing.md,
        marginBottom:spacing.sm
    },
    grid:{
        padding:spacing.md
    },
    cardWrapper:{
        flex:1,
        maxWidth:'33.33%',
        marginBottom:spacing.md,
        position:'relative'
    },
    removeButton:{
        position:'absolute',
        top:spacing.xs,
        left:spacing.xs,
        backgroundColor:colors.overlay,
        width:28,
        height:28,
        borderRadius:14,
        justifyContent:'center',
        alignItems:'center',
        zIndex:1
    }
})