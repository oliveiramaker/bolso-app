import { useSQLiteContext } from "expo-sqlite";
import { useEffect,useState } from "react";
import { ScrollView,StyleSheet,Text,View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Summary={income:number;expense:number};

export default function Home(){
 const db=useSQLiteContext(); const [s,setS]=useState<Summary>({income:0,expense:0});
 useEffect(()=>{db.getFirstAsync<Summary>(`SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) income, COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) expense FROM transactions WHERE date(date)=date('now','localtime')`).then(v=>v&&setS(v));},[db]);
 const balance=s.income-s.expense;
 return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.container}>
  <Text style={styles.brand}>Bolso</Text><Text style={styles.subtitle}>Suas finanças, no controle.</Text>
  <View style={styles.balance}><Text style={styles.label}>SALDO DE HOJE</Text><Text style={styles.value}>R$ {balance.toFixed(2).replace(".",",")}</Text></View>
  <View style={styles.row}><Card title="Entradas" value={s.income} positive/><Card title="Saídas" value={s.expense}/></View>
  <View style={styles.section}><Text style={styles.sectionTitle}>Próximos passos</Text><Text style={styles.muted}>Registre sua primeira entrada ou gasto pela aba Movimentos.</Text></View>
 </ScrollView></SafeAreaView>
}
function Card({title,value,positive}:{title:string;value:number;positive?:boolean}){return <View style={styles.card}><Text style={styles.label}>{title}</Text><Text style={[styles.cardValue,positive&&styles.green]}>R$ {Number(value).toFixed(2).replace(".",",")}</Text></View>}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:"#0A0A0F"},container:{padding:20,gap:18},brand:{color:"#F7F7FA",fontSize:34,fontWeight:"800"},subtitle:{color:"#858592",fontSize:14,marginTop:-12},balance:{backgroundColor:"#171720",borderRadius:24,padding:24,borderWidth:1,borderColor:"#262631"},label:{color:"#777783",fontSize:11,fontWeight:"700",letterSpacing:1},value:{color:"#F7F7FA",fontSize:36,fontWeight:"800",marginTop:8},row:{flexDirection:"row",gap:12},card:{flex:1,backgroundColor:"#14141C",borderRadius:18,padding:18},cardValue:{color:"#F7F7FA",fontSize:19,fontWeight:"700",marginTop:10},green:{color:"#C9F23D"},section:{backgroundColor:"#14141C",borderRadius:18,padding:20},sectionTitle:{color:"#F7F7FA",fontSize:17,fontWeight:"700",marginBottom:8},muted:{color:"#858592",lineHeight:20}});
