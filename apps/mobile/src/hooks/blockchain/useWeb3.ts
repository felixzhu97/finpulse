import {useAppDispatch, useAppSelector} from "@/src/store";
import {useCallback, useEffect} from "react";
import {web3Service} from "@/src/lib";
import {getWeb3Config} from "@/src/lib/config/web3Config";
import {connectWallet, disconnectWallet, refreshWalletBalance, syncFromService} from "@/src/store/web3Slice";

export function useWeb3() {
    const dispatch = useAppDispatch();
    const {walletInfo, loading, error} = useAppSelector((s) => s.web3);

    useEffect(() => {
        if (!web3Service.isInitialized()) {
            web3Service.initialize(getWeb3Config());
        }
        dispatch(syncFromService());
    }, [dispatch]);

    const connect = useCallback(
        async (privateKey?: string) => {
            const result = await dispatch(connectWallet(privateKey));
            if (connectWallet.fulfilled.match(result)) return result.payload;
            return null;
        },
        [dispatch]
    );

    const disconnect = useCallback(async () => {
        await dispatch(disconnectWallet());
    }, [dispatch]);

    const refreshBalance = useCallback(async () => {
        await dispatch(refreshWalletBalance());
    }, [dispatch]);

    return {
        walletInfo,
        loading,
        error,
        connect,
        disconnect,
        refreshBalance,
        isConnected: web3Service.isConnected(),
    };
}