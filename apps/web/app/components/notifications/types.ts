export type RealNotification = {
  createdAt: string;
  id: string;
  message: string;
  read: boolean;
  readAt?: string | null;
  role: string;
  title: string;
  type: string;
  userId?: string | null;
};
