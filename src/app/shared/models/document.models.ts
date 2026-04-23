export interface DocumentItem {
  id: number;
  groupId: number | null;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
