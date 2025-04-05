export interface User {
    id: string;
    name: string;
    status: string;
    lastSeen?: string;
  }
  
  export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    timestamp: string;
    status: string;
  }
  
  export interface ChatContact {
    id: string;
    name: string;
    message: string;
    time: string;
    hasNotification: boolean;
    notificationCount?: number;
    isRead: boolean;
    status: string;
    lastSeen?: string;
    isTyping?: boolean;
  }
  
  export interface ChatState {
    currentUser: User;
    contacts: ChatContact[];
    messages: Record<number, Message[]>;
    selectedContactId: string | null;
    onlineUsers: number[];
  }
  