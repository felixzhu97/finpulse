import {useAppDispatch, useAppSelector} from "@/src/store";
import {clearAuth, getAuthStorageKey, setAuth} from "@/src/store/authSlice";
import {useCallback} from "react";
import type {ChangePasswordRequest, LoginRequest, RegisterRequest} from "@/src/lib";
import * as authApi from "@/src/lib/api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {setAuthToken} from "@/src/lib/network/authBridge";

export function useAuth() {
    const dispatch = useAppDispatch();
    const {token, customer, restored} = useAppSelector((s) => s.auth);
    const key = getAuthStorageKey();

    const login = useCallback(
        async (body: LoginRequest): Promise<{ ok: boolean; error?: string }> => {
            const res = await authApi.login(body);
            if (!res) return {ok: false, error: "Invalid email or password"};
            await AsyncStorage.setItem(key, res.token);
            setAuthToken(res.token);
            dispatch(setAuth({token: res.token, customer: res.customer}));
            return {ok: true};
        },
        [dispatch, key]
    );

    const register = useCallback(
        async (body: RegisterRequest): Promise<{ ok: boolean; error?: string }> => {
            const res = await authApi.register(body);
            if (!res) return {ok: false, error: "Registration failed"};
            await AsyncStorage.setItem(key, res.token);
            setAuthToken(res.token);
            dispatch(setAuth({token: res.token, customer: res.customer}));
            return {ok: true};
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
            return ok ? {ok: true} : {ok: false, error: "Failed to change password"};
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