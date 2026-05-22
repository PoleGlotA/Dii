"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from "react";
import type {
  AppState,
  Post,
  User,
  Booking,
  BookingStatus,
  StoredCredential,
  NewPostInput,
  UpdatePostInput,
  Comment as PostComment,
  Donation,
  ChatMessage,
  Notification,
  NotificationKind,
  NotificationPrefs,
} from "@/types";
import { MOCK_POSTS, MOCK_USERS, MOCK_DONATIONS, DEMO_PASSWORD } from "./mockData";
import { hashPassword } from "./auth";
import { generateAvatar } from "./utils";

type Action =
  | { type: "SET_USER"; payload: User | null }
  | { type: "ADD_USER"; payload: { user: User; credential: StoredCredential } }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "ADD_BOOKING"; payload: Booking }
  | { type: "UPDATE_BOOKING"; payload: { id: string; status: BookingStatus } }
  | { type: "ADD_COMMENT"; payload: { postId: string; comment: PostComment } }
  | { type: "ADD_POST"; payload: Post }
  | { type: "UPDATE_POST"; payload: Post }
  | { type: "DELETE_POST"; payload: string }
  | { type: "ADD_DONATION"; payload: Donation }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "TOGGLE_SAVED"; payload: string }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "READ_NOTIFICATION"; payload: string }
  | { type: "READ_ALL_NOTIFICATIONS"; payload: string }
  | { type: "UPDATE_PREFS"; payload: Partial<NotificationPrefs> }
  | { type: "LOAD_STATE"; payload: Partial<AppState> }
  | { type: "ADMIN_BAN_USER"; payload: { userId: string; banned: boolean } }
  | { type: "ADMIN_VERIFY_USER"; payload: string }
  | { type: "ADMIN_DELETE_POST"; payload: string }
  | { type: "ADMIN_FEATURE_POST"; payload: { postId: string; featured: boolean } };

const defaultPrefs: NotificationPrefs = {
  bookings: true,
  comments: true,
  donations: true,
  chat: true,
  digest: false,
};

const initialState: AppState = {
  currentUser: null,
  users: MOCK_USERS,
  credentials: [],
  posts: MOCK_POSTS,
  bookings: [],
  donations: MOCK_DONATIONS,
  chatMessages: [],
  notifications: [],
  savedPostIds: [],
  prefs: defaultPrefs,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, currentUser: action.payload };

    case "ADD_USER":
      return {
        ...state,
        users: [...state.users, action.payload.user],
        credentials: [...state.credentials, action.payload.credential],
      };

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.payload.id ? action.payload : u)),
        currentUser:
          state.currentUser?.id === action.payload.id ? action.payload : state.currentUser,
      };

    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
        credentials: state.credentials.filter((c) => c.userId !== action.payload),
        posts: state.posts.filter((p) => p.authorId !== action.payload),
        bookings: state.bookings.filter((b) => b.userId !== action.payload),
        donations: state.donations.filter((d) => d.userId !== action.payload),
        currentUser: state.currentUser?.id === action.payload ? null : state.currentUser,
      };

    case "ADD_BOOKING": {
      const booking = action.payload;
      const posts = state.posts.map((p) =>
        p.id === booking.postId
          ? {
              ...p,
              bookings: [...p.bookings, booking],
              currentParticipants:
                p.type === "ПОДІЯ"
                  ? (p.currentParticipants ?? 0) + 1
                  : p.currentParticipants,
            }
          : p
      );
      return { ...state, bookings: [...state.bookings, booking], posts };
    }

    case "UPDATE_BOOKING": {
      const bookings = state.bookings.map((b) =>
        b.id === action.payload.id ? { ...b, status: action.payload.status } : b
      );
      const posts = state.posts.map((p) => ({
        ...p,
        bookings: p.bookings.map((b) =>
          b.id === action.payload.id ? { ...b, status: action.payload.status } : b
        ),
      }));
      return { ...state, bookings, posts };
    }

    case "ADD_COMMENT": {
      const posts = state.posts.map((p) =>
        p.id === action.payload.postId
          ? { ...p, comments: [...p.comments, action.payload.comment] }
          : p
      );
      return { ...state, posts };
    }

    case "ADD_POST":
      return { ...state, posts: [action.payload, ...state.posts] };

    case "UPDATE_POST":
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };

    case "DELETE_POST":
      return { ...state, posts: state.posts.filter((p) => p.id !== action.payload) };

    case "ADD_DONATION": {
      const donation = action.payload;
      const posts = state.posts.map((p) =>
        p.id === donation.postId
          ? { ...p, currentAmount: (p.currentAmount ?? 0) + donation.amount }
          : p
      );
      return { ...state, donations: [...state.donations, donation], posts };
    }

    case "ADD_MESSAGE":
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };

    case "TOGGLE_SAVED":
      return {
        ...state,
        savedPostIds: state.savedPostIds.includes(action.payload)
          ? state.savedPostIds.filter((id) => id !== action.payload)
          : [...state.savedPostIds, action.payload],
      };

    case "ADD_NOTIFICATION":
      return { ...state, notifications: [action.payload, ...state.notifications] };

    case "READ_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case "READ_ALL_NOTIFICATIONS":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.userId === action.payload ? { ...n, read: true } : n
        ),
      };

    case "UPDATE_PREFS":
      return { ...state, prefs: { ...state.prefs, ...action.payload } };

    case "LOAD_STATE":
      return { ...state, ...action.payload };

    case "ADMIN_BAN_USER":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.userId ? { ...u, banned: action.payload.banned } : u
        ),
        currentUser:
          state.currentUser?.id === action.payload.userId
            ? { ...state.currentUser, banned: action.payload.banned }
            : state.currentUser,
      };

    case "ADMIN_VERIFY_USER":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload ? { ...u, verified: true } : u
        ),
      };

    case "ADMIN_DELETE_POST":
      return { ...state, posts: state.posts.filter((p) => p.id !== action.payload) };

    case "ADMIN_FEATURE_POST":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.payload.postId ? { ...p, featured: action.payload.featured } : p
        ),
      };

    default:
      return state;
  }
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  location: string;
  role: "volunteer" | "organizer";
  bio?: string;
}

interface AppContextType {
  state: AppState;
  loginWithCredentials: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  register: (
    input: RegisterInput
  ) => Promise<{ ok: boolean; error?: string; user?: User }>;
  logout: () => void;
  deleteAccount: () => void;
  updateProfile: (patch: Partial<User>) => void;
  changePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  addBooking: (postId: string) => Booking | null;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  addComment: (postId: string, content: string) => void;
  createPost: (input: NewPostInput) => Post | null;
  updatePost: (input: UpdatePostInput) => Post | null;
  closePost: (postId: string, reportText?: string) => void;
  deletePost: (postId: string) => void;
  addDonation: (postId: string, amount: number, message?: string, anonymous?: boolean) => Donation | null;
  sendMessage: (postId: string, content: string) => void;
  toggleSaved: (postId: string) => void;
  isSaved: (postId: string) => boolean;
  unreadNotifications: () => number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updatePrefs: (patch: Partial<NotificationPrefs>) => void;
  getPostById: (id: string) => Post | undefined;
  getUserBookingForPost: (postId: string) => Booking | undefined;
  getUserById: (id: string) => User | undefined;
  adminBanUser: (userId: string, banned: boolean) => void;
  adminVerifyUser: (userId: string) => void;
  adminDeletePost: (postId: string) => void;
  adminFeaturePost: (postId: string, featured: boolean) => void;
  adminChangeRole: (userId: string, role: "volunteer" | "organizer") => void;
}

const AppContext = createContext<AppContextType | null>(null);
const STORAGE_KEY = "dii_state_v4";

function notify(
  dispatch: React.Dispatch<Action>,
  userId: string,
  kind: NotificationKind,
  title: string,
  body?: string,
  postId?: string,
  fromUserId?: string
) {
  const notification: Notification = {
    id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
    kind,
    title,
    body,
    postId,
    fromUserId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  dispatch({ type: "ADD_NOTIFICATION", payload: notification });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        let parsed: Partial<AppState> | null = null;
        if (saved) parsed = JSON.parse(saved) as Partial<AppState>;

        const seededCreds: StoredCredential[] = [];
        for (const u of MOCK_USERS) {
          const hash = await hashPassword(DEMO_PASSWORD);
          seededCreds.push({ email: u.email, passwordHash: hash, userId: u.id });
        }
        if (cancelled) return;

        const merged: Partial<AppState> = {
          currentUser: parsed?.currentUser ?? null,
          users: parsed?.users ?? MOCK_USERS,
          credentials: parsed?.credentials?.length ? parsed.credentials : seededCreds,
          bookings: parsed?.bookings ?? [],
          posts: parsed?.posts ?? MOCK_POSTS,
          donations: parsed?.donations ?? MOCK_DONATIONS,
          chatMessages: parsed?.chatMessages ?? [],
          notifications: parsed?.notifications ?? [],
          savedPostIds: parsed?.savedPostIds ?? [],
          prefs: parsed?.prefs ?? defaultPrefs,
        };
        dispatch({ type: "LOAD_STATE", payload: merged });
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      const normalized = email.trim().toLowerCase();
      const cred = state.credentials.find((c) => c.email.toLowerCase() === normalized);
      if (!cred) return { ok: false, error: "Користувача з таким email не знайдено" };
      const hash = await hashPassword(password);
      if (hash !== cred.passwordHash) return { ok: false, error: "Невірний пароль" };
      const user = state.users.find((u) => u.id === cred.userId);
      if (!user) return { ok: false, error: "Помилка профілю" };
      dispatch({ type: "SET_USER", payload: user });
      return { ok: true };
    },
    [state.credentials, state.users]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const normalized = input.email.trim().toLowerCase();
      const exists = state.credentials.some((c) => c.email.toLowerCase() === normalized);
      if (exists)
        return { ok: false as const, error: "Користувач з таким email вже існує" };
      const id = `u_${Date.now()}`;
      const user: User = {
        id,
        name: input.name.trim(),
        email: normalized,
        avatar: generateAvatar(input.name),
        role: input.role,
        karma: 0,
        location: input.location.trim(),
        bio: input.bio?.trim() ?? "",
        joinedAt: new Date().toISOString().slice(0, 10),
        eventsParticipated: [],
        activeCollections: [],
      };
      const passwordHash = await hashPassword(input.password);
      const credential: StoredCredential = { email: normalized, passwordHash, userId: id };
      dispatch({ type: "ADD_USER", payload: { user, credential } });
      dispatch({ type: "SET_USER", payload: user });
      return { ok: true as const, user };
    },
    [state.credentials]
  );

  const logout = useCallback(() => {
    dispatch({ type: "SET_USER", payload: null });
  }, []);

  const deleteAccount = useCallback(() => {
    if (!state.currentUser) return;
    dispatch({ type: "DELETE_USER", payload: state.currentUser.id });
  }, [state.currentUser]);

  const updateProfile = useCallback(
    (patch: Partial<User>) => {
      if (!state.currentUser) return;
      dispatch({ type: "UPDATE_USER", payload: { ...state.currentUser, ...patch } });
    },
    [state.currentUser]
  );

  const changePassword = useCallback(
    async (current: string, next: string) => {
      if (!state.currentUser) return { ok: false, error: "Не авторизовано" };
      const cred = state.credentials.find((c) => c.userId === state.currentUser!.id);
      if (!cred) return { ok: false, error: "Профіль не знайдено" };
      const currentHash = await hashPassword(current);
      if (currentHash !== cred.passwordHash)
        return { ok: false, error: "Поточний пароль невірний" };
      if (next.length < 6)
        return { ok: false, error: "Новий пароль мін. 6 символів" };
      const nextHash = await hashPassword(next);
      const updated = state.credentials.map((c) =>
        c.userId === state.currentUser!.id ? { ...c, passwordHash: nextHash } : c
      );
      dispatch({ type: "LOAD_STATE", payload: { credentials: updated } });
      return { ok: true };
    },
    [state.currentUser, state.credentials]
  );

  const addBooking = useCallback(
    (postId: string): Booking | null => {
      if (!state.currentUser) return null;
      const existing = state.bookings.find(
        (b) => b.postId === postId && b.userId === state.currentUser!.id
      );
      if (existing) return existing;
      const post = state.posts.find((p) => p.id === postId);
      const booking: Booking = {
        id: `b_${Date.now()}`,
        userId: state.currentUser.id,
        postId,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_BOOKING", payload: booking });
      if (post && state.prefs.bookings) {
        notify(
          dispatch,
          post.authorId,
          "booking_received",
          `Нова заявка від ${state.currentUser.name}`,
          post.title,
          post.id,
          state.currentUser.id
        );
      }
      return booking;
    },
    [state.currentUser, state.bookings, state.posts, state.prefs]
  );

  const updateBookingStatus = useCallback(
    (bookingId: string, status: BookingStatus) => {
      const booking = state.bookings.find((b) => b.id === bookingId);
      dispatch({ type: "UPDATE_BOOKING", payload: { id: bookingId, status } });
      if (booking && state.prefs.bookings) {
        const post = state.posts.find((p) => p.id === booking.postId);
        if (post) {
          notify(
            dispatch,
            booking.userId,
            status === "accepted" ? "booking_accepted" : "booking_rejected",
            status === "accepted" ? "Вашу заявку прийнято" : "Заявку відхилено",
            post.title,
            post.id,
            post.authorId
          );
        }
      }
    },
    [state.bookings, state.posts, state.prefs]
  );

  const addComment = useCallback(
    (postId: string, content: string) => {
      if (!state.currentUser) return;
      const comment: PostComment = {
        id: `c_${Date.now()}`,
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        userAvatar: state.currentUser.avatar,
        content,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_COMMENT", payload: { postId, comment } });
      const post = state.posts.find((p) => p.id === postId);
      if (post && post.authorId !== state.currentUser.id && state.prefs.comments) {
        notify(
          dispatch,
          post.authorId,
          "comment_received",
          `${state.currentUser.name} прокоментував(-ла)`,
          content.slice(0, 80),
          post.id,
          state.currentUser.id
        );
      }
    },
    [state.currentUser, state.posts, state.prefs]
  );

  const createPost = useCallback(
    (input: NewPostInput): Post | null => {
      if (!state.currentUser) return null;
      const post: Post = {
        id: `p_${Date.now()}`,
        type: input.type,
        title: input.title.trim(),
        description: input.description.trim(),
        content: input.content.trim(),
        date: input.date,
        location: input.location.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        authorId: state.currentUser.id,
        authorName: state.currentUser.name,
        authorAvatar: state.currentUser.avatar,
        status: "active",
        tags: input.tags.filter(Boolean),
        createdAt: new Date().toISOString(),
        image: input.image?.trim() || undefined,
        maxParticipants: input.maxParticipants,
        currentParticipants: input.maxParticipants !== undefined ? 0 : undefined,
        targetAmount: input.targetAmount,
        currentAmount: input.targetAmount !== undefined ? 0 : undefined,
        fundingLink: input.fundingLink?.trim() || undefined,
        comments: [],
        bookings: [],
      };
      dispatch({ type: "ADD_POST", payload: post });
      return post;
    },
    [state.currentUser]
  );

  const updatePost = useCallback(
    (input: UpdatePostInput): Post | null => {
      const existing = state.posts.find((p) => p.id === input.id);
      if (!existing) return null;
      const updated: Post = {
        ...existing,
        ...input,
        title: input.title?.trim() ?? existing.title,
        description: input.description?.trim() ?? existing.description,
        content: input.content?.trim() ?? existing.content,
        location: input.location?.trim() ?? existing.location,
        latitude: input.latitude ?? existing.latitude,
        longitude: input.longitude ?? existing.longitude,
        image: input.image !== undefined ? input.image || undefined : existing.image,
        tags: input.tags ? input.tags.filter(Boolean) : existing.tags,
      };
      dispatch({ type: "UPDATE_POST", payload: updated });
      return updated;
    },
    [state.posts]
  );

  const closePost = useCallback(
    (postId: string, reportText?: string) => {
      const existing = state.posts.find((p) => p.id === postId);
      if (!existing) return;
      const updated: Post = {
        ...existing,
        status: "closed",
        reportText: reportText ?? existing.reportText,
      };
      dispatch({ type: "UPDATE_POST", payload: updated });
    },
    [state.posts]
  );

  const deletePost = useCallback((postId: string) => {
    dispatch({ type: "DELETE_POST", payload: postId });
  }, []);

  const addDonation = useCallback(
    (postId: string, amount: number, message?: string, anonymous?: boolean): Donation | null => {
      if (!state.currentUser) return null;
      const post = state.posts.find((p) => p.id === postId);
      const donation: Donation = {
        id: `d_${Date.now()}`,
        postId,
        userId: state.currentUser.id,
        userName: anonymous ? "Анонім" : state.currentUser.name,
        userAvatar: anonymous ? "" : state.currentUser.avatar,
        amount,
        message,
        anonymous,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_DONATION", payload: donation });
      if (post && state.prefs.donations) {
        notify(
          dispatch,
          post.authorId,
          "donation_received",
          `Новий донат ${amount} грн`,
          message ?? post.title,
          post.id,
          state.currentUser.id
        );
      }
      return donation;
    },
    [state.currentUser, state.posts, state.prefs]
  );

  const sendMessage = useCallback(
    (postId: string, content: string) => {
      if (!state.currentUser) return;
      const message: ChatMessage = {
        id: `m_${Date.now()}`,
        postId,
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        userAvatar: state.currentUser.avatar,
        content,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_MESSAGE", payload: message });
    },
    [state.currentUser]
  );

  const toggleSaved = useCallback((postId: string) => {
    dispatch({ type: "TOGGLE_SAVED", payload: postId });
  }, []);

  const isSaved = useCallback(
    (postId: string) => state.savedPostIds.includes(postId),
    [state.savedPostIds]
  );

  const unreadNotifications = useCallback(() => {
    if (!state.currentUser) return 0;
    return state.notifications.filter(
      (n) => n.userId === state.currentUser!.id && !n.read
    ).length;
  }, [state.currentUser, state.notifications]);

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: "READ_NOTIFICATION", payload: id });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    if (!state.currentUser) return;
    dispatch({ type: "READ_ALL_NOTIFICATIONS", payload: state.currentUser.id });
  }, [state.currentUser]);

  const updatePrefs = useCallback((patch: Partial<NotificationPrefs>) => {
    dispatch({ type: "UPDATE_PREFS", payload: patch });
  }, []);

  const getPostById = useCallback(
    (id: string) => state.posts.find((p) => p.id === id),
    [state.posts]
  );

  const getUserBookingForPost = useCallback(
    (postId: string) => {
      if (!state.currentUser) return undefined;
      return state.bookings.find(
        (b) => b.postId === postId && b.userId === state.currentUser!.id
      );
    },
    [state.currentUser, state.bookings]
  );

  const getUserById = useCallback(
    (id: string) => state.users.find((u) => u.id === id),
    [state.users]
  );

  const adminBanUser = useCallback((userId: string, banned: boolean) => {
    dispatch({ type: "ADMIN_BAN_USER", payload: { userId, banned } });
  }, []);

  const adminVerifyUser = useCallback((userId: string) => {
    dispatch({ type: "ADMIN_VERIFY_USER", payload: userId });
  }, []);

  const adminDeletePost = useCallback((postId: string) => {
    dispatch({ type: "ADMIN_DELETE_POST", payload: postId });
  }, []);

  const adminFeaturePost = useCallback((postId: string, featured: boolean) => {
    dispatch({ type: "ADMIN_FEATURE_POST", payload: { postId, featured } });
  }, []);

  const adminChangeRole = useCallback((userId: string, role: "volunteer" | "organizer") => {
    const user = state.users.find((u) => u.id === userId);
    if (!user) return;
    dispatch({ type: "UPDATE_USER", payload: { ...user, role } });
  }, [state.users]);

  return (
    <AppContext.Provider
      value={{
        state,
        loginWithCredentials,
        register,
        logout,
        deleteAccount,
        updateProfile,
        changePassword,
        addBooking,
        updateBookingStatus,
        addComment,
        createPost,
        updatePost,
        closePost,
        deletePost,
        addDonation,
        sendMessage,
        toggleSaved,
        isSaved,
        unreadNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        updatePrefs,
        getPostById,
        getUserBookingForPost,
        getUserById,
        adminBanUser,
        adminVerifyUser,
        adminDeletePost,
        adminFeaturePost,
        adminChangeRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
