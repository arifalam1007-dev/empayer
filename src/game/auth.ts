/* ============================================================
   Business Empire — demo auth (localStorage-backed)

   This module deliberately mirrors the shape of real auth
   providers. To connect Firebase or Supabase later, implement
   the same `AuthProvider` interface:

   - signInWithGoogle()  -> supabase.auth.signInWithOAuth({ provider: 'google' })
                            or firebase signInWithPopup(GoogleAuthProvider)
   - signUpWithEmail()   -> supabase.auth.signUp({ email, password })
   - signInWithEmail()   -> supabase.auth.signInWithPassword()
   - onSession()         -> supabase.auth.onAuthStateChange()

   The rest of the game only talks to this interface, so the
   swap is contained to this file.
   ============================================================ */

import type { AccountUser, Provider } from "./data";
import { uid } from "./engine";

export interface AuthResult {
  ok: boolean;
  user?: AccountUser;
  error?: string;
}

export interface AuthProvider {
  signUpWithEmail(name: string, email: string, password: string): Promise<AuthResult>;
  signInWithEmail(email: string, password: string): Promise<AuthResult>;
  signInWithGoogle(): Promise<AuthResult>;
  signOut(): void;
  getSession(): AccountUser | null;
}

interface StoredUser extends AccountUser {
  passHash: string;
}

const USERS_KEY = "be_users_v1";
const SESSION_KEY = "be_session_v1";

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* Demo-grade one-way hash. Real deployment: never roll your own —
   Firebase/Supabase handle credential storage server-side. */
function demoHash(pw: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < pw.length; i++) {
    const c = pw.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c, 2246822519) >>> 0;
  }
  return `dh_${h1.toString(16)}${h2.toString(16)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function toAccount(u: StoredUser): AccountUser {
  return { uid: u.uid, name: u.name, email: u.email, provider: u.provider, company: u.company, createdAt: u.createdAt };
}

function fakeLatency(): Promise<void> {
  return new Promise((r) => setTimeout(r, 420));
}

class DemoAuthProvider implements AuthProvider {
  getSession(): AccountUser | null {
    try {
      const uidVal = localStorage.getItem(SESSION_KEY);
      if (!uidVal) return null;
      const user = readUsers().find((u) => u.uid === uidVal);
      return user ? toAccount(user) : null;
    } catch {
      return null;
    }
  }

  signOut(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  async signUpWithEmail(name: string, email: string, password: string): Promise<AuthResult> {
    await fakeLatency();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) return { ok: false, error: "Enter your name (2+ characters)." };
    if (!EMAIL_RE.test(cleanEmail)) return { ok: false, error: "That email doesn't look valid." };
    if (password.length < 6) return { ok: false, error: "Password needs at least 6 characters." };
    const users = readUsers();
    if (users.some((u) => u.email === cleanEmail))
      return { ok: false, error: "An account with this email already exists. Sign in instead." };
    const user: StoredUser = {
      uid: uid("u"),
      name: cleanName,
      email: cleanEmail,
      provider: "email" as Provider,
      company: `${cleanName}'s Empire`,
      createdAt: Date.now(),
      passHash: demoHash(password),
    };
    writeUsers([...users, user]);
    localStorage.setItem(SESSION_KEY, user.uid);
    return { ok: true, user: toAccount(user) };
  }

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    await fakeLatency();
    const cleanEmail = email.trim().toLowerCase();
    const users = readUsers();
    const user = users.find((u) => u.email === cleanEmail);
    if (!user) return { ok: false, error: "No account found for this email. Create one first." };
    if (user.provider === "google") return { ok: false, error: "This account uses Google sign-in." };
    if (user.passHash !== demoHash(password)) return { ok: false, error: "Incorrect password. Try again." };
    localStorage.setItem(SESSION_KEY, user.uid);
    return { ok: true, user: toAccount(user) };
  }

  /* Demo stand-in for OAuth. A real integration opens the Google
     consent screen; here we provision/reuse a demo Google account. */
  async signInWithGoogle(): Promise<AuthResult> {
    await fakeLatency();
    const users = readUsers();
    const email = "demo.tycoon@gmail.com";
    let user = users.find((u) => u.email === email);
    if (!user) {
      user = {
        uid: uid("u"),
        name: "Demo Tycoon",
        email,
        provider: "google" as Provider,
        company: "Tycoon Ventures Inc.",
        createdAt: Date.now(),
        passHash: "",
      };
      writeUsers([...users, user]);
    }
    localStorage.setItem(SESSION_KEY, user.uid);
    return { ok: true, user: toAccount(user) };
  }
}

export const auth: AuthProvider = new DemoAuthProvider();
