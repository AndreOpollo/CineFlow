import { colors, spacing } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from "expo-status-bar";
import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WebView from "react-native-webview";

export default function PlayerScreen(){
    const{ url } = useLocalSearchParams<{url:string}>()
    const router = useRouter()
    const[loading,setLoading] = useState(true)

    useEffect(()=>{
        async function lockOrientation(){
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.LANDSCAPE
            )
        }
        lockOrientation()

        return()=>{
            ScreenOrientation.unlockAsync()
        }

    },[])


    if(!url){
        return(
            <View style={styles.container}>
                <Text style={{color:colors.text}}>Invalid video url </Text>
            </View>
        )
    }

    const decodedUrl = decodeURIComponent(url)

    return (
        <View style={styles.container}>
      <StatusBar hidden />
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <X size={24} color={colors.text} />
      </TouchableOpacity>
      <WebView
        source={{ uri: decodedUrl }}
        style={styles.webView}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
    )


}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:colors.background
    },
    closeButton:{
        position:'absolute',
        top:50,
        right:spacing.md,
        width:40,
        height:40,
        borderRadius: 20,
        backgroundColor:colors.overlay,
        justifyContent:'center',
        alignItems:'center',
        zIndex:1000
    },
    webView:{
        flex:1,
        backgroundColor:colors.background
    }

})