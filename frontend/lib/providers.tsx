"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { apiFetch, getCookieToken } from "./auth";
import { User } from "./models";

export const TokenContext = createContext({
    token: "",
    setToken: (token: string) => {}
});

export const UserContext = createContext<User>({} as User);

type Props = {
    children: ReactNode;
};

export default function Providers({ children }: Props) {
    const [token, setToken] = useState("");
    const tokenValue = { token, setToken };

    const [user, setUser] = useState<User>({} as User);

    useEffect(() => {
        getCookieToken().then((value) => {
            if (value && value.length > 0) setToken(value);
        });
    }, [getCookieToken]);

    useEffect(() => {
        apiFetch("/auth/me")
            .then((response) => {
                response
                    .json()
                    .then((value: User) => {
                        setUser(value);
                    })
                    .catch(() => setUser({} as User));
            })
            .catch(() => setUser({} as User));
    }, [token]);

    return (
        <TokenContext.Provider value={tokenValue}>
            <UserContext.Provider value={user}>{children}</UserContext.Provider>
        </TokenContext.Provider>
    );
}
