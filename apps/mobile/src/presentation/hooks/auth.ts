import { useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppDispatch, useAppSelector } from "../store";
import { setAuth, setCustomer, clearAuth, setRestored, getAuthStorageKey } from "../store/authSlice";
import { setAuthToken } from "../../infrastructure/network/authBridge";
import * as authApi from "../../infrastructure/api/auth";
import type { LoginRequest, RegisterRequest, ChangePasswordRequest } from "../../infrastructure/api/auth";

export function useAuthTokenSync(): void {
  const token = useAppSelector((s) => s.auth.token);
  useEffect(() => {
    setAuthToken(token);
  }, [token]);
}

export function useAuthRestore(): void {
  const dispatch = useAppDispatch();
  const restored = useAppSelector((s) => s.auth.restored);

  useEffect(() => {
    if (restored) return;
    const key = getAuthStorageKey();
    AsyncStorage.getItem(key)
      .then((stored) => {
        if (stored) {
          setAuthToken(stored);
          dispatch(setAuth({ token: stored, customer: null }));
        } else {
          dispatch(setRestored(true));
        }
      })
      .catch(() => dispatch(setRestored(true)));
  }, [dispatch, restored]);
}

export function useAuthFetchCustomer(): void {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const customer = useAppSelector((s) => s.auth.customer);

  useEffect(() => {
    if (!token || customer) return;
    authApi.getMe().then((c) => {
      if (c) dispatch(setCustomer(c));
    });
  }, [dispatch, token, customer]);
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const { token, customer, restored } = useAppSelector((s) => s.auth);
  const key = getAuthStorageKey();

  const login = useCallback(
    async (body: LoginRequest): Promise<{ ok: boolean; error?: string }> => {
      const res = await authApi.login(body);
      if (!res) return { ok: false, error: "Invalid email or password" };
      await AsyncStorage.setItem(key, res.token);
      setAuthToken(res.token);
      dispatch(setAuth({ token: res.token, customer: res.customer }));
      return { ok: true };
    },
    [dispatch, key]
  );

  const register = useCallback(
    async (body: RegisterRequest): Promise<{ ok: boolean; error?: string }> => {
      const res = await authApi.register(body);
      if (!res) return { ok: false, error: "Registration failed" };
      await AsyncStorage.setItem(key, res.token);
      setAuthToken(res.token);
      dispatch(setAuth({ token: res.token, customer: res.customer }));
      return { ok: true };
    },
    [dispatch, key]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    await AsyncStorage.removeItem(key);
    setAuthToken(null);
    dispatch(clearAuth());
  }, [dispatch, key]);

  const changePassword = useCallback(
    async (body: ChangePasswordRequest): Promise<{ ok: boolean; error?: string }> => {
      const ok = await authApi.changePassword(body);
      return ok ? { ok: true } : { ok: false, error: "Failed to change password" };
    },
    []
  );

  return {
    token,
    customer,
    restored,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    changePassword,
  };
}
