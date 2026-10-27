"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
import { getCookieToken } from "./auth";

export const TokenContext = createContext({
    token: "",
    setToken: (token: string) => {},
});

type Props = {
    children: ReactNode;
};

export default function Providers({ children }: Props) {
    const [token, setToken] = useState("");
    const tokenValue = { token, setToken };

    useEffect(() => {
        getCookieToken().then((value) => {
            if (value && value.length > 0) setToken(value);
        });
    }, [getCookieToken]);

    return <TokenContext.Provider value={tokenValue}>{children}</TokenContext.Provider>;
}
