import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SoundContextType {
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('soundEnabled');
            return saved !== null ? JSON.parse(saved) : true; 
        }
        return true;
    });

    useEffect(() => {
        localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    }, [soundEnabled]);

    return (
        <SoundContext.Provider value={{ soundEnabled, setSoundEnabled }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useSound = () => {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};
