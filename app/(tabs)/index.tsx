import EmptyState from "@/components/EmptyState";
import HeroCarousel from "@/components/HeroCarousel";
import HorizontalShelf from "@/components/HorizontalShelf";
import { SkeletonShelf } from "@/components/SkeletonLoader";
import { colors, spacing } from "@/constants/theme";
import { LatestMovie, LatestTvShow, TrendingMovie } from "@/db/schema";
import { ContentService } from "@/services/content";
import { DatabaseService } from "@/services/database";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen(){
  const[trending,setTrending] = useState<TrendingMovie[]>([])
  const[latestMovies,setLatestMovies] = useState<LatestMovie[]>([])
  const[latestTvShows,setLatestTvShows]=useState<LatestTvShow[]>([])
  const[loading,setLoading] = useState(true)
  const[refreshing,setRefreshing] = useState(false)

  useEffect(()=>{
      loadContent()
  },[])

  async function loadContent(){
    try {
      const cachedTrending = DatabaseService.getTrending()
      const cachedMovies = DatabaseService.getLatestMovies()
      const cachedTvShows = DatabaseService.getLatestTvShows()

      setTrending(cachedTrending)
      setLatestMovies(cachedMovies)
      setLatestTvShows(cachedTvShows)
      setLoading(false)

      await ContentService.smartRefresh()

      setTrending(DatabaseService.getTrending())
      setLatestMovies(DatabaseService.getLatestMovies())
      setLatestTvShows(DatabaseService.getLatestTvShows())

    } catch (error) {
      console.error('Error loading content',error)
      setLoading(false)
      
    }
  }

  async function onRefresh(){
    setRefreshing(true)
    try {
      await ContentService.refreshHomeContent()

      setTrending(DatabaseService.getTrending())
      setLatestMovies(DatabaseService.getLatestMovies())
      setLatestTvShows(DatabaseService.getLatestTvShows())
      
    } catch (error) {
      console.error('Refresh failed:',error)
      
    }finally{
      setRefreshing(false)

    }
  }

  const showLoading = loading && trending.length === 0

  const isEmpty = !loading && !refreshing && trending.length === 0  && latestMovies.length ===0 && latestTvShows.length === 0

  return(
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={"light"}/>
      {isEmpty ? (
        <EmptyState title={"No Content Available"} message={"Pull down to refresh and load content"}/>
      ):(
        <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
          refreshing = {refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          />
        }>
          {showLoading?(
              <View style={styles.heroSkeleton}/>
          ):trending.length>0?(
              <HeroCarousel movies={trending}/>
          ):null}

          {showLoading ? (
            <SkeletonShelf />
          ) : (
            latestMovies.length > 0 && (
              <HorizontalShelf
                title="Latest Movies"
                items={latestMovies}
                type="movie"
              />
            )
          )}

          {showLoading ? (
            <SkeletonShelf />
          ) : (
            latestTvShows.length > 0 && (
              <HorizontalShelf
                title="Latest TV Shows"
                items={latestTvShows}
                type="tv"
              />
            )
          )}
          <View style={styles.bottomSpacer}/>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:colors.background
  },
  scrollView:{
    flex:1
  },
  heroSkeleton:{
    width:'100%',
    height:400,
    backgroundColor:colors.surfaceLight,
    marginBottom:spacing.lg
  },
  bottomSpacer:{
    height:spacing.xl
  }
})