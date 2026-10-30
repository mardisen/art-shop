"use client";

import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { apiFetch, getCookieToken } from "./auth";
import { User } from "./models";

export const TokenContext = createContext({
    token: "",
    setToken: (token: string) => {}
});

export const UserContext = createContext<{ user: User; refreshUser: () => Promise<void> }>({
    user: {} as User,
    refreshUser: async () => {}
});

type Props = {
    children: ReactNode;
};

export default function Providers({ children }: Props) {
    const [token, setToken] = useState("");
    const tokenValue = { token, setToken };

    const [user, setUser] = useState<User>({} as User);

    const refreshUser = useCallback(async () => {
        if (!token) {
            setUser({} as User);
            return;
        }
        try {
            const response = await apiFetch("/auth/me");
            const value = await response.json();
            setUser(value);
        } catch {
            setUser({} as User);
        }
    }, [token]);

    useEffect(() => {
        getCookieToken().then((value) => {
            if (value && value.length > 0) {
                setToken(value);
            } else {
                setToken("");
                setUser({} as User);
            }
        });
    }, []);

    useEffect(() => {
        refreshUser();
    }, [token, refreshUser]);

    return (
        <TokenContext.Provider value={tokenValue}>
            <UserContext.Provider value={{ user, refreshUser }}>{children}</UserContext.Provider>
        </TokenContext.Provider>
    );
}
