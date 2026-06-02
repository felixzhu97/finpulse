import {useAppDispatch, useAppSelector} from "@/src/store";
import {useEffect} from "react";
import {getAuthStorageKey, setAuth, setRestored} from "@/src/store/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {setAuthToken} from "@/src/lib/network/authBridge";

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
                    dispatch(setAuth({token: stored, customer: null}));
                } else {
                    dispatch(setRestored(true));
                }
            })
            .catch(() => dispatch(setRestored(true)));
    }, [dispatch, restored]);
}