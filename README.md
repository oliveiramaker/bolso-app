# Bolso App

Aplicativo de finanças pessoais do Bolso, reconstruído como app nativo com React Native, Expo, TypeScript e SQLite.

## Funcionalidades

- Dashboard mensal com saldo, entradas, saídas e lançamentos recentes.
- Navegação por mês.
- Entradas e gastos.
- Categorias padrão.
- Edição e exclusão de movimentações.
- Parcelamentos com distribuição automática das parcelas.
- Movimentações recorrentes semanais, mensais e anuais.
- Orçamento mensal por categoria com acompanhamento de consumo.
- Metas com prazo, progresso e contribuições.
- Relatório de gastos por categoria.
- Backup completo em JSON.
- Restauração de backup em JSON.
- Exclusão de todos os dados.
- Funcionamento local/offline com SQLite.

## Stack

- Expo SDK 57
- React Native 0.86
- TypeScript
- Expo Router
- Expo SQLite

O banco SQLite é persistente entre reinicializações do aplicativo. O schema usa migrações versionadas para preservar compatibilidade com versões anteriores. citeturn0search0

## Desenvolvimento

Node.js 22.13.x ou superior é necessário para Expo SDK 57. citeturn1search4

```bash
npm install
npx expo start
```

## Android

Para gerar um APK de teste com EAS:

```bash
npx eas build --profile preview --platform android
```

Para produção:

```bash
npx eas build --profile production --platform android
```

A sincronização com Supabase/login em nuvem permanece como uma etapa separada, depois da estabilização da versão local.
