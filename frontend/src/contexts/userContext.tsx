"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import PocketBase from 'pocketbase';


export const UserContext = createContext({});

export const useUserContext = () => {
    return useContext(UserContext);
};

type Props = {
    children: ReactNode;
};

export const UserContextProvider = ({ children }: Props) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [componentLoading, setComponentLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reload, setReload] = useState(false);
    const client = new PocketBase("http://127.0.0.1:8090");

    useEffect(() => {
        async function checkAuth() {
            await client.collection("usuarios").authRefresh()
                .then((newAuthData) => {
                    setUser(newAuthData.record.id);
                })
                .catch((error) => {
                    throw error;
                })
        }
        checkAuth()
            .catch((error) => {
                logout(true)
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
                setReload(!reload);
            })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signInWithEmail = async (username: string, password: string) => {
        setLoading(true);

        await client.collection("usuarios").authWithPassword(username, password).then((newAuthData) => {
            setUser(newAuthData.record.id);
        }).catch((error) => {
            setError(error);
            console.log(error);
        }
        ).finally(() => {
            setLoading(false);
        });
    }

    const logout = (noalert: boolean | null) => {
        client.authStore.clear();
        setUser(null);
        if (!noalert || noalert === null) {
            alert("Sessão encerrada com sucesso");
        }
    }

    const createAccount = async (userData: any) => {
        setLoading(true);

        await client.collection("usuarios").create(userData).then((newAuthData) => {
            setUser(newAuthData.record.id);
        }).catch((error) => {
            setError(error);
            console.log(error);
        }
        ).finally(() => {
            setLoading(false);
        });
    }

    const contextValue = {
        user,
        loading,
        componentLoading,
        error,
        reload,
        client,
        setLoading,
        setComponentLoading,
        setReload,
        signInWithEmail,
        createAccount,
        logout
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )
}