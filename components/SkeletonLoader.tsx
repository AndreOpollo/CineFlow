import { borderRadius, cardSizes, colors, spacing } from "@/constants/theme"
import { useEffect, useRef } from "react"
import { Animated, StyleSheet, View } from "react-native"


interface SkeletonCardProps{
    width?: number
    height?:number
}

export function SkeletonCard({
    width = cardSizes.poster.width,
    height = cardSizes.poster.height}:SkeletonCardProps){
    
    const opacity = useRef(new Animated.Value(0.3)).current

    useEffect(()=>{
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity,{
                    toValue:0.7,
                    duration: 800,
                    useNativeDriver:true
                }),
                Animated.timing(opacity,{
                    toValue:0.3,
                    duration:800,
                    useNativeDriver:true
                })
            ])
        ).start()
    },[])

return (
    <View style={[styles.container,{width,marginRight:spacing.sm}]}>
        <Animated.View style={[
            styles.skeleton,
            {width,height,opacity}
        ]}/>
        <View style={styles.titleSkeleton}/>
    </View>
)

}

export function SkeletonShelf(){
    return (
        <View style={styles.shelfContainer}>
            <View style={styles.shelfTitleSkeleton}/>
            <View style={styles.cardsContainer}>
                {[1,2,3].map((i)=>(
                    <SkeletonCard key={i}/>
                ))

                }

            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        marginRight:spacing.sm
    },
    skeleton:{
        backgroundColor:colors.surfaceLight,
        borderRadius: borderRadius.md
    },
    titleSkeleton:{
        marginTop:spacing.xs,
        width:'80%',
        height:14,
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.sm
    },
    shelfContainer:{
        marginBottom:spacing.lg,
        paddingLeft:spacing.md
    },
    shelfTitleSkeleton:{
        width:150,
        height:24,
        backgroundColor:colors.surfaceLight,
        borderRadius:borderRadius.sm,
        marginBottom:spacing.sm
    },
    cardsContainer:{
        flexDirection:'row'
    }
})