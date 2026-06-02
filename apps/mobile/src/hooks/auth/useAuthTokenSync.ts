import {useAppSelector} from "@/src/store";
import {useEffect} from "react";
import {setAuthToken} from "@/src/lib/network/authBridge";

export function useAuthTokenSync(): void {
    const token = useAppSelector((s) => s.auth.token);
    useEffect(() => {
        setAuthToken(token);
    }, [token]);
}