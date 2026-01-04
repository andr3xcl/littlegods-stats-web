import { useCallback } from 'react';
import { useSound } from '../contexts/SoundContext';

import hoverSound from '../data/sounds/web_interaction/cac_grid_nav.wav';
import selectSound from '../data/sounds/web_interaction/cac_grid_select.wav';
import exitSound from '../data/sounds/web_interaction/cac_exit.wav';
import zoomInSound from '../data/sounds/web_interaction/zoom_in.wav';
import statsSound from '../data/sounds/web_interaction/globe_move_out.wav';
import panSound from '../data/sounds/web_interaction/cac_hpan.wav';
import equipSound from '../data/sounds/web_interaction/ui_equip.wav';

export const useUISounds = () => {
    const { sfxEnabled } = useSound();

    const playSound = useCallback((path: string, volume = 0.2) => {
        if (!sfxEnabled) return undefined;

        try {
            const audio = new Audio(path);
            audio.volume = volume;
            audio.play().catch(e => {
                console.warn('Audio play failed for:', path, e);
            });
            return audio;
        } catch (e) {
            console.warn('Audio init failed', e);
            return undefined;
        }
    }, [sfxEnabled]);

    const playHover = useCallback(() => playSound(hoverSound, 0.15), [playSound]);
    const playSelect = useCallback(() => playSound(selectSound, 0.3), [playSound]);
    const playExit = useCallback(() => playSound(exitSound, 0.3), [playSound]);
    const playZoomIn = useCallback(() => playSound(zoomInSound, 0.3), [playSound]);
    const playStats = useCallback(() => playSound(statsSound, 0.4), [playSound]);
    const playPan = useCallback(() => playSound(panSound, 0.5), [playSound]);
    const playEquip = useCallback(() => playSound(equipSound, 0.4), [playSound]);

    return { playHover, playSelect, playExit, playZoomIn, playStats, playPan, playEquip };
};
