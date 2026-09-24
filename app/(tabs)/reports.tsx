import { useFocusEffect } from "expo-router";
import { useCallback,useState } from "react";
import { ScrollView,StyleSheet,Text,View,Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { currentMonth,getMonthSummary } from "@/database/finance";
import { monthLabel,shiftMonth } from "@/utils/date";
import { formatBRL } from "@/utils/currency";

type Row={category_name:string;total:number};
export default function Reports(){
 const db=useSQLiteContext();const [month,setMonth]=useState(currentMonth());const [summary,setSummary]=useState({income:0,expense:0});const [rows,setRows]=useState<Row[]>([]);
 const load=useCallback(async()=>{setSummary((await getMonthSummary(db,month))??{income:0,expense:0});setRows(await db.getAllAsync<Row>(`SELECT COALESCE(c.name,'Sem categoria') category_name,COALESCE(SUM(t.amount),0) total FROM transactions t LEFT JOIN categories c ON c.id=t.category_id WHERE t.type='expense' AND substr(t.date,1,7)=? GROUP BY t.category_id ORDER BY total DESC`,month));},[db,month]);
 useFocusEffect(useCallback(()=>{load()},[load]));
 const max=rows[0]?.total||1;
 return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.container}><Text style={s.title}>Relatórios</Text><Text style={s.muted}>Visão financeira do mês selecionado.</Text>
 <View style={s.month}><Pressable onPress={()=>setMonth(shiftMonth(month,-1))}><Text style={s.arrow}>‹</Text></Pressable><Text style={s.monthText}>{monthLabel(month)}</Text><Pressable onPress={()=>setMonth(shiftMonth(month,1))}><Text style={s.arrow}>›</Text></Pressable></View>
 <View style={s.row}><View style={s.card}><Text style={s.label}>ENTRADAS</Text><Text style={s.green}>{formatBRL(summary.income)}</Text></View><View style={s.card}><Text style={s.label}>SAÍDAS</Text><Text style={s.red}>{formatBRL(summary.expense)}</Text></View></View>
 <View style={s.section}><Text style={s.sectionTitle}>Gastos por categoria</Text>{rows.length===0?<Text style={s.muted}>Sem gastos registrados.</Text>:rows.map(r=><View key={r.category_name} style={s.item}><View style={s.head}><Text style={s.name}>{r.category_name}</Text><Text style={s.value}>{formatBRL(r.total)}</Text></View><View style={s.bar}><View style={[s.fill,{width:(r.total/max*100)+"%"}]}/></View></View>)}</View>
 <View style={s.section}><Text style={s.sectionTitle}>Resumo</Text><Text style={s.muted}>Saldo: <Text style={s.white}>{formatBRL(summary.income-summary.expense)}</Text></Text><Text style={s.muted}>Taxa de gastos sobre entradas: <Text style={s.white}>{summary.income?Math.round(summary.expense/summary.income*100):0}%</Text></Text></View>
 </ScrollView></SafeAreaView>
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:"#0A0A0F"},container:{padding:20,gap:13,paddingBottom:40},title:{color:"#F7F7FA",fontSize:28,fontWeight:"800"},muted:{color:"#858592",fontSize:13},month:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",backgroundColor:"#14141C",padding:8,borderRadius:16},monthText:{color:"#F7F7FA",fontWeight:"700"},arrow:{color:"#C9F23D",fontSize:28,paddingHorizontal:10},row:{flexDirection:"row",gap:10},card:{flex:1,backgroundColor:"#14141C",borderRadius:18,padding:16},label:{color:"#777783",fontSize:10,fontWeight:"800"},green:{color:"#C9F23D",fontSize:17,fontWeight:"800",marginTop:8},red:{color:"#FF6675",fontSize:17,fontWeight:"800",marginTop:8},section:{backgroundColor:"#14141C",borderRadius:18,padding:17},sectionTitle:{color:"#F7F7FA",fontSize:17,fontWeight:"800",marginBottom:10},item:{paddingVertical:9},head:{flexDirection:"row",justifyContent:"space-between"},name:{color:"#F7F7FA",fontWeight:"600"},value:{color:"#F7F7FA",fontWeight:"700"},bar:{height:8,backgroundColor:"#292934",borderRadius:8,overflow:"hidden",marginTop:7},fill:{height:"100%",backgroundColor:"#C9F23D"},white:{color:"#F7F7FA",fontWeight:"700"}});