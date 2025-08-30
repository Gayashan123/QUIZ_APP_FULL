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
      // if invalid JSON was stored, clear it
      localStorage.removeItem("userInfo");
      return null;
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!user?.token) return;
      try {
        const res = await axios.get(`${apiurl}checkauth`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        // Extract teacher_id robustly from response
        const data = res?.data ?? {};
        const teacherId =
          data?.teacher_id ??
          data?.data?.teacher_id ??
          data?.user?.teacher_id ??
          data?.user?.id ??
          data?.id ??
          null;

        if (teacherId) {
          const nextUser = { ...user, teacher_id: Number(teacherId) };
          setUser(nextUser);
          localStorage.setItem("userInfo", JSON.stringify(nextUser));
        }
      } catch (err) {
        console.error("checkauth failed:", err?.response?.data || err?.message);
        // if token invalid, logout
        setUser(null);
        localStorage.removeItem("userInfo");
      }
    };

    checkAuth();
  }, [user?.token]); // only when token changes

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