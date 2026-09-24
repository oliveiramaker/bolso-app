import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { getMonthSummary, getMonthTransactions, currentMonth } from "@/database/finance";
import { formatBRL } from "@/utils/currency";
import { monthLabel, shiftMonth } from "@/utils/date";

export default function Home(){
 const db=useSQLiteContext();
 const [month,setMonth]=useState(currentMonth());
 const [summary,setSummary]=useState({income:0,expense:0});
 const [recent,setRecent]=useState<any[]>([]);
 const load=useCallback(async()=>{setSummary((await getMonthSummary(db,month))??{income:0,expense:0});setRecent((await getMonthTransactions(db,month)).slice(0,5));},[db,month]);
 useFocusEffect(useCallback(()=>{load();},[load]));
 const balance=summary.income-summary.expense;
 return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.container}>
   <View style={s.head}><View><Text style={s.brand}>Bolso</Text><Text style={s.muted}>Suas finanças, no controle.</Text></View></View>
   <View style={s.month}><Pressable onPress={()=>setMonth(shiftMonth(month,-1))}><Text style={s.arrow}>‹</Text></Pressable><Text style={s.monthText}>{monthLabel(month)}</Text><Pressable onPress={()=>setMonth(shiftMonth(month,1))}><Text style={s.arrow}>›</Text></Pressable></View>
   <View style={s.balance}><Text style={s.label}>SALDO DO MÊS</Text><Text style={s.value}>{formatBRL(balance)}</Text></View>
   <View style={s.row}><Card title="Entradas" value={summary.income} green/><Card title="Saídas" value={summary.expense}/></View>
   <View style={s.section}><Text style={s.sectionTitle}>Movimentações recentes</Text>
    {recent.length===0?<Text style={s.muted}>Nenhuma movimentação neste mês.</Text>:recent.map(t=><View key={t.id} style={s.item}><View style={{flex:1}}><Text style={s.itemTitle}>{t.description}</Text><Text style={s.muted}>{t.category_name??"Sem categoria"} • {t.date.slice(8,10)}/{t.date.slice(5,7)}</Text></View><Text style={[s.itemValue,t.type==="income"&&s.green]}>{t.type==="income"?"+":"−"} {formatBRL(t.amount)}</Text></View>)}
   </View>
 </ScrollView></SafeAreaView>
}
function Card({title,value,green}:{title:string;value:number;green?:boolean}){return <View style={s.card}><Text style={s.label}>{title}</Text><Text style={[s.cardValue,green&&s.green]}>{formatBRL(value)}</Text></View>}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:"#0A0A0F"},container:{padding:20,gap:14},head:{marginBottom:2},brand:{color:"#F7F7FA",fontSize:34,fontWeight:"800"},muted:{color:"#858592",fontSize:13},month:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",backgroundColor:"#14141C",borderRadius:16,paddingHorizontal:10,paddingVertical:8},monthText:{color:"#F7F7FA",fontSize:16,fontWeight:"700"},arrow:{color:"#C9F23D",fontSize:30,paddingHorizontal:10},balance:{backgroundColor:"#171720",borderRadius:24,padding:24,borderWidth:1,borderColor:"#282833"},label:{color:"#777783",fontSize:10,fontWeight:"800",letterSpacing:1},value:{color:"#F7F7FA",fontSize:34,fontWeight:"800",marginTop:8},row:{flexDirection:"row",gap:12},card:{flex:1,backgroundColor:"#14141C",borderRadius:18,padding:18},cardValue:{color:"#F7F7FA",fontSize:18,fontWeight:"700",marginTop:9},green:{color:"#C9F23D"},section:{backgroundColor:"#14141C",borderRadius:18,padding:18},sectionTitle:{color:"#F7F7FA",fontSize:17,fontWeight:"700",marginBottom:12},item:{flexDirection:"row",alignItems:"center",paddingVertical:11,borderBottomWidth:1,borderBottomColor:"#24242D"},itemTitle:{color:"#F7F7FA",fontSize:14,fontWeight:"600"},itemValue:{color:"#FF6675",fontSize:14,fontWeight:"700"}});