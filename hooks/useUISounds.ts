import { useCallback } from 'react';
import { useSound } from '../contexts/SoundContext';

const HOVER_SOUND = './data/sounds/web_interaction/cac_grid_nav.wav';
const SELECT_SOUND = './data/sounds/web_interaction/cac_grid_select.wav';
const EXIT_SOUND = './data/sounds/web_interaction/cac_exit.wav';
const ZOOM_IN_SOUND = './data/sounds/web_interaction/zoom_in.wav';

export const useUISounds = () => {
    const { soundEnabled } = useSound();

    const playSound = useCallback((path: string, volume = 0.2) => {
        if (!soundEnabled) return; // Don't play if sounds are disabled

        try {
            const audio = new Audio(path);
            audio.volume = volume;
            audio.play().catch(e => {
                console.warn('Audio play failed for:', path, e);
            });
        } catch (e) {
            console.warn('Audio init failed', e);
        }
    }, [soundEnabled]);

    const playHover = useCallback(() => playSound(HOVER_SOUND, 0.15), [playSound]);
    const playSelect = useCallback(() => playSound(SELECT_SOUND, 0.3), [playSound]);
    const playExit = useCallback(() => playSound(EXIT_SOUND, 0.3), [playSound]);
    const playZoomIn = useCallback(() => playSound(ZOOM_IN_SOUND, 0.3), [playSound]);

    return { playHover, playSelect, playExit, playZoomIn };
};
