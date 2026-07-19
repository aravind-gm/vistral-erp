"use client";

import { useCallback, useEffect, useState } from "react";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type SessionData = {
  user: SessionUser;
};

type SessionResponse = {
  session: SessionData | null;
};

let sessionCache: SessionData | null = null;
let sessionCacheReady = false;
const listeners = new Set<() => void>();

function notifySessionChange() {
  for (const listener of listeners) {
    listener();
  }
}

async function fetchSession(): Promise<SessionData | null> {
  const response = await fetch("/api/generic-auth/session", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    sessionCache = null;
    sessionCacheReady = true;
    notifySessionChange();
    return null;
  }

  const json = (await response.json()) as SessionResponse;
  sessionCache = json.session;
  sessionCacheReady = true;
  notifySessionChange();
  return sessionCache;
}

export const signIn = {
  email: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
    callbackURL?: string;
  }) => {
    const response = await fetch("/api/generic-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return { error: { message: "Invalid email or password" } };
    }

    const json = (await response.json()) as SessionResponse;
    sessionCache = json.session;
    sessionCacheReady = true;
    notifySessionChange();

    return { error: null, data: json };
  },
};

export async function signOut() {
  await fetch("/api/generic-auth/logout", {
    method: "POST",
    credentials: "include",
  });

  sessionCache = null;
  sessionCacheReady = true;
  notifySessionChange();
}

export async function getSession() {
  return fetchSession();
}

export function useSession() {
  const [data, setData] = useState<SessionData | null>(sessionCache);
  const [isPending, setIsPending] = useState(!sessionCacheReady);

  const refresh = useCallback(async () => {
    setIsPending(true);
    const latest = await fetchSession();
    setData(latest);
    setIsPending(false);
  }, []);

  useEffect(() => {
    const syncFromCache = () => {
      setData(sessionCache);
      setIsPending(!sessionCacheReady);
    };

    listeners.add(syncFromCache);
    syncFromCache();

    if (!sessionCacheReady) {
      void refresh();
    }

    return () => {
      listeners.delete(syncFromCache);
    };
  }, [refresh]);

  return { data, isPending, refresh };
}

export async function signUp() {
  return { error: { message: "Sign up is disabled in generic test auth mode" } };
}
