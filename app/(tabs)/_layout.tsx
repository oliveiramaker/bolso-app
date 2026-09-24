import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
const green="#C9F23D";
export default function TabsLayout(){return <Tabs screenOptions={{headerShown:false,tabBarStyle:{backgroundColor:"#111118",borderTopColor:"#24242D",height:72,paddingBottom:8,paddingTop:8},tabBarActiveTintColor:green,tabBarInactiveTintColor:"#777783",tabBarLabelStyle:{fontSize:10,fontWeight:"600"}}}>
<Tabs.Screen name="index" options={{title:"Início",tabBarIcon:({color,size})=><Ionicons name="grid-outline" color={color} size={size}/>}}/>
<Tabs.Screen name="transactions" options={{title:"Movimentos",tabBarIcon:({color,size})=><Ionicons name="swap-horizontal-outline" color={color} size={size}/>}}/>
<Tabs.Screen name="budgets" options={{title:"Orçamento",tabBarIcon:({color,size})=><Ionicons name="pie-chart-outline" color={color} size={size}/>}}/>
<Tabs.Screen name="goals" options={{title:"Metas",tabBarIcon:({color,size})=><Ionicons name="flag-outline" color={color} size={size}/>}}/>
<Tabs.Screen name="reports" options={{title:"Relatórios",tabBarIcon:({color,size})=><Ionicons name="bar-chart-outline" color={color} size={size}/>}}/>
</Tabs>}