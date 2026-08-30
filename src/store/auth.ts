/* ============================================================
   Demo auth store — local "accounts" persisted in localStorage.

   To go live later, swap the bodies of signUp / signIn /
   signInGoogle with Firebase (signInWithPopup + GoogleAuthProvider)
   or Supabase (supabase.auth.signInWithOAuth / signUp). The rest of
   the app only consumes the `User` shape below, so nothing else
   needs to change.

   Every storage access is guarded so the game keeps working even in
   sandboxed iframes where localStorage throws.
   ============================================================ */
import { create } from "zustand";

export interface User {
  uid: string;
  name: string;
  email: string;
  provider: "email" | "google" | "guest";
  createdAt: number;
}

interface StoredUser extends User {
  hash: string;
}

const USERS_KEY = "be_users_v1";
const SESSION_KEY = "be_session_v1";

/* --- storage access that never throws --- */
const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, val: string) {
    try {
      localStorage.setItem(key, val);
    } catch {
      /* sandboxed / full — play in-memory */
    }
  },
  del(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

const readUsers = (): Record<string, StoredUser> => {
  try {
    return JSON.parse(storage.get(USERS_KEY) || "{}");
  } catch {
    return {};
  }
};
const writeUsers = (u: Record<string, StoredUser>) => storage.set(USERS_KEY, JSON.stringify(u));

/** demo-grade hash — replace with real auth provider later */
export const djb2 = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
};

const mkUid = () => "u_" + Math.random().toString(36).slice(2, 10);

interface AuthStore {
  user: User | null;
  busy: boolean;
  boot: () => void;
  signUp: (name: string, email: string, pass: string) => string | null;
  signIn: (email: string, pass: string) => string | null;
  signInGoogle: () => void;
  guest: () => void;
  signOut: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  busy: false,

  boot: () => {
    try {
      const sess = storage.get(SESSION_KEY);
      if (!sess) return;
      if (sess.startsWith("guest")) {
        set({ user: { uid: "guest", name: "Guest Tycoon", email: "guest@local", provider: "guest", createdAt: Date.now() } });
        return;
      }
      const u = readUsers()[sess];
      if (u) {
        const { hash: _h, ...pub } = u;
        set({ user: pub });
      }
    } catch {
      /* never crash the app over storage */
    }
  },

  signUp: (name, email, pass) => {
    email = email.trim().toLowerCase();
    if (!name.trim()) return "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (pass.length < 4) return "Password needs at least 4 characters.";
    const users = readUsers();
    if (users[email]) return "An account with this email already exists.";
    const u: StoredUser = { uid: mkUid(), name: name.trim(), email, provider: "email", createdAt: Date.now(), hash: djb2(pass) };
    users[email] = u;
    writeUsers(users);
    storage.set(SESSION_KEY, email);
    const { hash: _h, ...pub } = u;
    set({ user: pub });
    return null;
  },

  signIn: (email, pass) => {
    email = email.trim().toLowerCase();
    const u = readUsers()[email];
    if (!u) return "No account found for this email.";
    if (u.hash !== djb2(pass)) return "Wrong password. Try again.";
    storage.set(SESSION_KEY, email);
    const { hash: _h, ...pub } = u;
    set({ user: pub });
    return null;
  },

  signInGoogle: () => {
    // Demo stand-in for `signInWithPopup(auth, new GoogleAuthProvider())`.
    set({ busy: true });
    setTimeout(() => {
      const email = "alex.morgan@gmail.com";
      const users = readUsers();
      let u = users[email];
      if (!u) {
        u = { uid: mkUid(), name: "Alex Morgan", email, provider: "google", createdAt: Date.now(), hash: "" };
        users[email] = u;
        writeUsers(users);
      }
      storage.set(SESSION_KEY, email);
      const { hash: _h, ...pub } = u;
      set({ user: pub, busy: false });
    }, 700);
  },

  guest: () => {
    storage.set(SESSION_KEY, "guest");
    set({ user: { uid: "guest", name: "Guest Tycoon", email: "guest@local", provider: "guest", createdAt: Date.now() } });
  },

  signOut: () => {
    storage.del(SESSION_KEY);
    set({ user: null });
  },
}));
