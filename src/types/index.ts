export interface User {
  averageScore: number;
  id: string;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
  level?: number;
  streak?: number;
  joinDate?: string;
  // Add other user properties as needed
}
