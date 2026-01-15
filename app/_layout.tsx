import { colors } from "@/constants/theme";
import { iniatilizeDatabase } from "@/db/init";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function RootLayout(){
  const[dbReady,setDbReady] = useState(false)
  const[error,setError] = useState<string | null>(null)

  useEffect(()=>{
    try {
      iniatilizeDatabase()
      setDbReady(true) 
    } catch (error:any) {
      setError(error.message)
      console.error('Database Initialization FAILED',error)      
    }

  },[])

  if(error){
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Database Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    )
  }

  if(!dbReady){
    return(
      <View style={styles.centerContainer}>
        <ActivityIndicator size={'large'} color={colors.primary}/>
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    )
  }

  return(
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name="(tabs)"/>
      <Stack.Screen 
      name="details/[type]/[id]"
      options={{presentation:'card'}}/>
      <Stack.Screen name="player" options={{presentation:'fullScreenModal'}}/>

    </Stack>
  )
}

const styles = StyleSheet.create({
  centerContainer:{

  },
  errorText:{

  },
  errorMessage:{

  },
  loadingText:{

  }
})