import {useAppDispatch, useAppSelector} from "@/src/store";
import {useEffect} from "react";
import * as authApi from "@/src/api/auth";
import {setCustomer} from "@/src/store/authSlice";

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