"use client";

import { useEffect, useState } from "react";
import {
  accountLoginUrl,
  accountLogoutUrl,
  clearInfinitySession,
  getInfinitySession,
  type InfinityWebUser,
} from "@/lib/infinity-web-auth";

export function useInfinityWebAuth() {
  const [user, setUser] = useState<InfinityWebUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getInfinitySession().then(nextUser => {
      if (!active) return;
      setUser(nextUser);
      setIsLoading(false);
    }).catch(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  function login() {
    window.location.assign(accountLoginUrl());
  }

  async function logout() {
    await clearInfinitySession();
    window.location.assign(accountLogoutUrl());
    setUser(null);
  }

  return { user, isLoading, login, logout };
}
