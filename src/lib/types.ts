export interface userInterface {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  profilePicture: string;
  isOnline: boolean;
  sendMessage?: (destination: string, body: any) => void;
  subscribe?: (destination: string, callback: (body: any) => void) => void;
  unsubscribe?: (destination: string) => void;
  disconnect?: () => void;
  collapse?: boolean;
}

export interface messageInterface {
  id?: string;
  sender: string;
  receiver:string;
  senderEm?: userInterface;
  receiverEm?: userInterface;
  file?:{
    type: string;
    name: string;
    link: string;
  },
  group?:string,
  content: string;
  created_At: string;
  isRead?: {
    user: string;
    readAt: Date;
  }[];
}

export interface notificationInterface {
  _id: string;
  sender?: string;
  receiver?: string;
  group?: string;
  title: string;
  description: string;
  type: string;
  time: number;
  popup?: boolean;
}

export interface groupInterface {
  _id: string;
  name: string;
  logo: string;
  members: string[];
  admins: string[];
}