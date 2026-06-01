import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loadingAuth: boolean;
    login: (userData: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const contextId = useMemo(() => Math.floor(Math.random() * 1000), []);

    useEffect(() => {
        console.log(`AuthContext [ID:${contextId}]: Inicjalizacja...`);
        const loadStoredSession = async () => {
            try {
                const storedUser = await SecureStore.getItemAsync('user_session');
                const storedToken = await SecureStore.getItemAsync('user_token');

                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                    console.log(`AuthContext [ID:${contextId}]: Wczytano sesję z SecureStore.`);
                } else {
                    console.log(`AuthContext [ID:${contextId}]: Brak zapisanej sesji.`);
                }
            } catch (error) {
                console.error("AuthContext Load Error:", error);
            } finally {
                setLoadingAuth(false);
            }
        };
        loadStoredSession();
    }, []);

    const login = async (userData: User, token: string) => {
        console.log(`AuthContext [ID:${contextId}]: Wywołano funkcję login!`);
        await SecureStore.setItemAsync('user_token', token);
        await SecureStore.setItemAsync('user_session', JSON.stringify(userData));

        setToken(token);
        setUser(userData);
        console.log(`AuthContext [ID:${contextId}]: Login zakończony, stan zaktualizowany.`);
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('user_token');
        await SecureStore.deleteItemAsync('user_session');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loadingAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth musi być użyte wewnątrz AuthProvider');
    }
    return context;
}