import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { migrateDbIfNeeded } from "@/database/migrations";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="bolso.db" onInit={migrateDbIfNeeded}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0A0A0F" } }} />
    </SQLiteProvider>
  );
}