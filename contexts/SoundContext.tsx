import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type MusicTiming = 'sequential' | 'instant';

interface SoundContextType {
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    musicEnabled: boolean;
    setMusicEnabled: (enabled: boolean) => void;
    sfxEnabled: boolean;
    setSfxEnabled: (enabled: boolean) => void;
    musicTiming: MusicTiming;
    setMusicTiming: (timing: MusicTiming) => void;
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

    const [musicEnabled, setMusicEnabled] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('musicEnabled');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sfxEnabled');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    const [musicTiming, setMusicTiming] = useState<MusicTiming>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('musicTiming');
            return (saved === 'sequential' || saved === 'instant') ? saved : 'sequential';
        }
        return 'sequential';
    });

    useEffect(() => {
        localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    }, [soundEnabled]);

    useEffect(() => {
        localStorage.setItem('musicEnabled', JSON.stringify(musicEnabled));
    }, [musicEnabled]);

    useEffect(() => {
        localStorage.setItem('sfxEnabled', JSON.stringify(sfxEnabled));
    }, [sfxEnabled]);

    useEffect(() => {
        localStorage.setItem('musicTiming', musicTiming);
    }, [musicTiming]);

    return (
        <SoundContext.Provider value={{
            soundEnabled,
            setSoundEnabled,
            musicEnabled,
            setMusicEnabled,
            sfxEnabled,
            setSfxEnabled,
            musicTiming,
            setMusicTiming
        }}>
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
