export type Message = {
  id: string;
  from: "user" | "bot";
  text?: string;
  tableData?: any[];
  ts: number;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};