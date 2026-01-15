import { colors } from "@/constants/theme";
import { Tabs } from "expo-router";
import { Heart, Home, Search } from "lucide-react-native";

export default function TabLayout(){
  return (
    <Tabs 
      screenOptions={{
        tabBarActiveTintColor:colors.primary,
        tabBarInactiveTintColor:colors.textSecondary,
        tabBarStyle:{
          backgroundColor:colors.surface,
          borderTopColor:colors.surfaceLight
        },
        headerStyle:{
          backgroundColor:colors.surface
        },
        headerTintColor:colors.text
      }}>
        <Tabs.Screen
        name="index"
        options={{
          title:'Home',
          tabBarIcon:({color,size})=><Home size={size} color={color}/>,
          headerShown:false
        }}/>
        <Tabs.Screen
        name="search"
        options={{
          title:'Search',
          tabBarIcon:({color,size})=><Search size={size} color={color}/>,
          headerShown:false
        }}/>
        <Tabs.Screen
        name="watchlist"
        options={{
          title:'Watchlist',
          tabBarIcon:({color,size})=><Heart size={size} color={color}/>,
          headerShown:false
        }}
        />

    </Tabs>
  )

}