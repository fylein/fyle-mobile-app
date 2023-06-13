export interface FreshChatResponse {
  status: number;
  data: {
    allowed: boolean;
    enabled: boolean;
    restoreId?: number;
  };
}
