import React, { createContext, useContext, useState, useEffect } from 'react';

export type MapImagePreference = 'real' | 'bonus';

interface SettingsContextType {
    mapImagePreference: MapImagePreference;
    setMapImagePreference: (pref: MapImagePreference) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mapImagePreference, setMapImagePreferenceState] = useState<MapImagePreference>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mapImagePreference') as MapImagePreference | null;
            return saved === 'bonus' ? 'bonus' : 'real'; 
        }
        return 'real';
    });

    useEffect(() => {
        localStorage.setItem('mapImagePreference', mapImagePreference);
    }, [mapImagePreference]);

    const setMapImagePreference = (pref: MapImagePreference) => {
        setMapImagePreferenceState(pref);
    };

    return (
        <SettingsContext.Provider value={{ mapImagePreference, setMapImagePreference }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
