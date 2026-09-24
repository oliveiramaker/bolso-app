import { useState } from "react";
import { Alert,Pressable,ScrollView,StyleSheet,Text,View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { File, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { deleteAllData, restoreBackup } from "@/database/finance";

export default function Settings(){
 const db=useSQLiteContext();const [busy,setBusy]=useState(false);
 const backup=async()=>{try{setBusy(true);const [transactions,categories,budgets,goals,contributions,recurring]=await Promise.all([
  db.getAllAsync("SELECT * FROM transactions"),db.getAllAsync("SELECT * FROM categories"),db.getAllAsync("SELECT * FROM budgets"),db.getAllAsync("SELECT * FROM goals"),db.getAllAsync("SELECT * FROM goal_contributions"),db.getAllAsync("SELECT * FROM recurring_transactions")
 ]);const file=new File(Paths.cache,"bolso-backup-"+Date.now()+".json");file.create();await file.write(JSON.stringify({app:"Bolso",version:1,exportedAt:new Date().toISOString(),transactions,categories,budgets,goals,contributions,recurring},null,2));if(await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri,{mimeType:"application/json",dialogTitle:"Exportar backup do Bolso"});else Alert.alert("Backup criado",file.uri)}catch(e){Alert.alert("Erro","Não foi possível criar o backup.")}finally{setBusy(false)}};
 const restore=async()=>{try{const result=await DocumentPicker.getDocumentAsync({type:"application/json",copyToCacheDirectory:true});if(result.canceled)return;const file=new File(result.assets[0].uri);const data=JSON.parse(await file.text());Alert.alert("Restaurar backup?","Os dados atuais serão substituídos.",[{text:"Cancelar",style:"cancel"},{text:"Restaurar",style:"destructive",onPress:async()=>{try{await restoreBackup(db,data);Alert.alert("Concluído","Backup restaurado com sucesso.")}catch{Alert.alert("Erro","O arquivo não é um backup válido do Bolso.")}}}])}catch{Alert.alert("Erro","Não foi possível ler o backup.")}};
 const clear=()=>Alert.alert("Apagar todos os dados?","Todas as movimentações, orçamentos e metas serão removidos deste aparelho.",[{text:"Cancelar",style:"cancel"},{text:"Apagar tudo",style:"destructive",onPress:async()=>{await deleteAllData(db);Alert.alert("Concluído","Os dados foram apagados.")}}]);
 return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.container}><Text style={s.title}>Configurações</Text><Text style={s.muted}>Dados do Bolso ficam armazenados localmente neste aparelho.</Text>
 <View style={s.card}><Text style={s.cardTitle}>Backup</Text><Text style={s.muted}>Exporte seus dados em JSON para guardar uma cópia.</Text><Pressable style={s.primary} onPress={backup} disabled={busy}><Text style={s.primaryText}>{busy?"Gerando…":"Exportar backup"}</Text></Pressable><Pressable style={s.secondary} onPress={restore}><Text style={s.secondaryText}>Restaurar backup</Text></Pressable></View>
 <View style={s.card}><Text style={s.cardTitle}>Dados</Text><Text style={s.muted}>Use esta opção somente se quiser começar novamente.</Text><Pressable style={s.danger} onPress={clear}><Text style={s.dangerText}>Apagar todos os dados</Text></Pressable></View>
 <View style={s.card}><Text style={s.cardTitle}>Sobre</Text><Text style={s.muted}>Bolso • finanças pessoais • modo offline</Text><Text style={s.version}>Versão 1.0.0</Text></View>
 </ScrollView></SafeAreaView>
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:"#0A0A0F"},container:{padding:20,gap:14},title:{color:"#F7F7FA",fontSize:28,fontWeight:"800"},muted:{color:"#858592",fontSize:13,lineHeight:19},card:{backgroundColor:"#14141C",borderRadius:18,padding:18,gap:10},cardTitle:{color:"#F7F7FA",fontSize:17,fontWeight:"800"},primary:{backgroundColor:"#C9F23D",padding:14,borderRadius:13,alignItems:"center",marginTop:5},primaryText:{color:"#0A0A0F",fontWeight:"800"},secondary:{backgroundColor:"#25252F",padding:14,borderRadius:13,alignItems:"center"},secondaryText:{color:"#C9F23D",fontWeight:"800"},danger:{backgroundColor:"#29161A",padding:14,borderRadius:13,alignItems:"center",marginTop:5},dangerText:{color:"#FF6675",fontWeight:"800"},version:{color:"#555560",fontSize:11,marginTop:5}});