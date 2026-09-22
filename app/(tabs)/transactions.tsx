import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Alert,Pressable,StyleSheet,Text,TextInput,View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Transactions(){
 const db=useSQLiteContext(); const [description,setDescription]=useState(""); const [amount,setAmount]=useState("");
 async function add(type:"income"|"expense"){
   const n=Number(amount.replace(",","."));
   if(!description.trim()||!Number.isFinite(n)||n<=0){Alert.alert("Valor inválido","Informe descrição e um valor maior que zero.");return}
   await db.runAsync("INSERT INTO transactions (type,description,amount,date) VALUES (?,?,?,date('now','localtime'))",type,description.trim(),n);
   setDescription("");setAmount("");Alert.alert("Salvo","Movimento registrado.");
 }
 return <SafeAreaView style={styles.safe}><View style={styles.container}><Text style={styles.title}>Movimentos</Text><Text style={styles.muted}>Registre entradas e gastos.</Text>
 <TextInput placeholder="Descrição" placeholderTextColor="#666673" value={description} onChangeText={setDescription} style={styles.input}/>
 <TextInput placeholder="Valor" placeholderTextColor="#666673" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={styles.input}/>
 <View style={styles.row}><Pressable style={[styles.button,styles.income]} onPress={()=>add("income")}><Text style={styles.buttonText}>+ Entrada</Text></Pressable><Pressable style={[styles.button,styles.expense]} onPress={()=>add("expense")}><Text style={styles.buttonText}>− Gasto</Text></Pressable></View>
 </View></SafeAreaView>
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:"#0A0A0F"},container:{padding:20,gap:14},title:{color:"#F7F7FA",fontSize:30,fontWeight:"800"},muted:{color:"#858592"},input:{backgroundColor:"#171720",color:"#F7F7FA",borderRadius:16,padding:17,fontSize:16,borderWidth:1,borderColor:"#282833"},row:{flexDirection:"row",gap:12},button:{flex:1,padding:17,borderRadius:16,alignItems:"center"},income:{backgroundColor:"#C9F23D"},expense:{backgroundColor:"#24242E"},buttonText:{fontWeight:"800",color:"#0A0A0F"}});