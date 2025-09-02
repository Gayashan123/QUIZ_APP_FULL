import React, { createContext, useMemo, useState, useEffect } from "react";
import axios from "axios";
import { apiurl } from "../Admin/common/Http";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("userInfo");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem("userInfo");
      return null;
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!user?.token || !user?.type) return;

      let endpoint = "";
      if (user.type === "teacher") endpoint = "checkauth";
      if (user.type === "admin") endpoint = "adcheckauth";
      if (user.type === "student") endpoint = "stcheckauth";

      try {
        const res = await axios.get(`${apiurl}${endpoint}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const data = res?.data ?? {};
        let id =
          data?.teacher?.id ??
          data?.admin?.id ??
          data?.student?.id ??
          data?.id ??
          null;

        if (id) {
          const nextUser = { ...user, id: Number(id) };
          setUser(nextUser);
          localStorage.setItem("userInfo", JSON.stringify(nextUser));
        }
      } catch (err) {
        console.error("checkauth failed:", err?.response?.data || err?.message);
        setUser(null);
        localStorage.removeItem("userInfo");
      }
    };

    checkAuth();
  }, [user?.token, user?.type]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};