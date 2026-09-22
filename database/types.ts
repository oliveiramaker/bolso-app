export type TransactionType = "income" | "expense";

export interface Transaction {
  id:number;
  type:TransactionType;
  description:string;
  amount:number;
  date:string;
  category_id:string|null;
  payment_method:string|null;
  installment_group_id:number|null;
  installment_number:number|null;
  created_at:string;
}
