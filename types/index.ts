export type PostType = "ЗБІР" | "ПОДІЯ" | "НОВИНА";
export type PostStatus = "active" | "urgent" | "closed";
export type BookingStatus = "pending" | "accepted" | "rejected";
export type UserRole = "volunteer" | "organizer";

export type NotificationKind =
  | "booking_received"
  | "booking_accepted"
  | "booking_rejected"
  | "comment_received"
  | "donation_received"
  | "post_closed"
  | "chat_message";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  karma: number;
  location: string;
  latitude?: number;
  longitude?: number;
  bio: string;
  joinedAt: string;
  eventsParticipated: string[];
  activeCollections: string[];
  verified?: boolean;
  isAdmin?: boolean;
  banned?: boolean;
}

export interface StoredCredential {
  email: string;
  passwordHash: string;
  userId: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  postId: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Donation {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  amount: number;
  message?: string;
  anonymous?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface ReportImage {
  url: string;
  caption?: string;
}

export interface Post {
  id: string;
  type: PostType;
  title: string;
  description: string;
  content: string;
  date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  status: PostStatus;
  tags: string[];
  createdAt: string;
  image?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  targetAmount?: number;
  currentAmount?: number;
  fundingLink?: string;
  reportImages?: ReportImage[];
  reportText?: string;
  featured?: boolean;
  comments: Comment[];
  bookings: Booking[];
}

export interface Notification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  postId?: string;
  fromUserId?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPrefs {
  bookings: boolean;
  comments: boolean;
  donations: boolean;
  chat: boolean;
  digest: boolean;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  credentials: StoredCredential[];
  posts: Post[];
  bookings: Booking[];
  donations: Donation[];
  chatMessages: ChatMessage[];
  notifications: Notification[];
  savedPostIds: string[];
  prefs: NotificationPrefs;
}

export interface NewPostInput {
  type: PostType;
  title: string;
  description: string;
  content: string;
  date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  tags: string[];
  maxParticipants?: number;
  targetAmount?: number;
  fundingLink?: string;
}

export type UpdatePostInput = Partial<NewPostInput> & { id: string; status?: PostStatus; latitude?: number; longitude?: number };
