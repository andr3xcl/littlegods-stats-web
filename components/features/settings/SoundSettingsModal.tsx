import React, { useState, useRef, useEffect } from 'react';
import { X, Music, Volume2, Settings, Clock, Zap, Play, Pause } from 'lucide-react';
import { useSound } from '../../../contexts/SoundContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useUISounds } from '../../../hooks/useUISounds';
import damnedMusic from '../../../data/sounds/web_music/Damned.ogg';

interface SoundSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({ isOpen, onClose }) => {
    const { musicEnabled, setMusicEnabled, sfxEnabled, setSfxEnabled, musicTiming, setMusicTiming } = useSound();
    const { t } = useLanguage();
    const { playHover, playSelect, playExit, playStats, playZoomIn, playPan, playEquip } = useUISounds();

    const [showMusicAdvanced, setShowMusicAdvanced] = useState(false);
    const [showSfxAdvanced, setShowSfxAdvanced] = useState(false);
    const [isTestingMusic, setIsTestingMusic] = useState(false);

    const testMusicRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            if (testMusicRef.current) {
                testMusicRef.current.pause();
            }
            setIsTestingMusic(false);
            setShowMusicAdvanced(false);
            setShowSfxAdvanced(false);
        }

        return () => {
            if (testMusicRef.current) {
                testMusicRef.current.pause();
                testMusicRef.current = null;
            }
        };
    }, [isOpen]);

    const toggleTestMusic = () => {
        if (isTestingMusic) {
            testMusicRef.current?.pause();
            setIsTestingMusic(false);
        } else {
            if (!testMusicRef.current) {
                testMusicRef.current = new Audio(damnedMusic);
                testMusicRef.current.volume = 0.3;
                testMusicRef.current.onended = () => setIsTestingMusic(false);
            }
            testMusicRef.current.play().catch(console.warn);
            setIsTestingMusic(true);
        }
    };

    const sfxList = [
        { name: t('settings.sound.sfx.hover'), play: playHover },
        { name: t('settings.sound.sfx.select'), play: playSelect },
        { name: t('settings.sound.sfx.exit'), play: playExit },
        { name: t('settings.sound.sfx.zoom'), play: playZoomIn },
        { name: t('settings.sound.sfx.stats'), play: playStats },
        { name: t('settings.sound.sfx.pan'), play: playPan },
        { name: t('settings.sound.sfx.equip'), play: playEquip },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {}
            <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
                {}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <h2 className="text-2xl font-black text-white">
                        {t('settings.sound.title')}
                    </h2>
                    <p className="text-sm text-orange-100 mt-1">
                        {t('settings.sound.modalSubtitle') || 'Personaliza tu experiencia de audio'}
                    </p>
                </div>

                {}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                    <Music className="w-6 h-6 text-purple-500" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            {t('settings.sound.music') || 'Música'}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setShowMusicAdvanced(!showMusicAdvanced)}
                                                className={`p-1 rounded-md transition-all ${showMusicAdvanced ? 'bg-purple-500 text-white animate-spin-slow' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                title="Configuración avanzada"
                                            >
                                                <Settings className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('settings.sound.musicDesc') || 'Música de fondo'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setMusicEnabled(!musicEnabled)}
                                className={`
                                    relative w-14 h-8 rounded-full transition-all duration-300
                                    ${musicEnabled
                                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                    }
                                `}
                            >
                                <div className={`
                                    absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300
                                    ${musicEnabled ? 'left-7' : 'left-1'}
                                `} />
                            </button>
                        </div>

                        {}
                        {showMusicAdvanced && (
                            <div className="pl-14 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        {t('settings.sound.musicTiming') || 'Momento de Inicio'}
                                    </label>
                                    <button
                                        onClick={toggleTestMusic}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${isTestingMusic ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                    >
                                        {isTestingMusic ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                        {t('settings.sound.testMusic')}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => setMusicTiming('sequential')}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200
                                            ${musicTiming === 'sequential'
                                                ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400'
                                                : 'border-slate-100 dark:border-slate-700 text-slate-500 hover:border-slate-200 dark:hover:border-slate-600'
                                            }
                                        `}
                                    >
                                        <Clock className={`w-4 h-4 ${musicTiming === 'sequential' ? 'text-purple-500' : ''}`} />
                                        <span className="text-sm font-bold">{t('settings.sound.timingSequential') || 'Después del efecto'}</span>
                                    </button>
                                    <button
                                        onClick={() => setMusicTiming('instant')}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200
                                            ${musicTiming === 'instant'
                                                ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400'
                                                : 'border-slate-100 dark:border-slate-700 text-slate-500 hover:border-slate-200 dark:hover:bg-slate-600'
                                            }
                                        `}
                                    >
                                        <Zap className={`w-4 h-4 ${musicTiming === 'instant' ? 'text-orange-500' : ''}`} />
                                        <span className="text-sm font-bold">{t('settings.sound.timingInstant') || 'Al instante'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {}
                    <div className="h-px bg-slate-200 dark:bg-slate-700" />

                    {}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <Volume2 className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            {t('settings.sound.sfx') || 'Efectos de Sonido'}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setShowSfxAdvanced(!showSfxAdvanced)}
                                                className={`p-1 rounded-md transition-all ${showSfxAdvanced ? 'bg-blue-500 text-white animate-spin-slow' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                title="Configuración avanzada"
                                            >
                                                <Settings className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('settings.sound.sfxDesc') || 'Sonidos de interfaz'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSfxEnabled(!sfxEnabled)}
                                className={`
                                    relative w-14 h-8 rounded-full transition-all duration-300
                                    ${sfxEnabled
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                    }
                                `}
                            >
                                <div className={`
                                    absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300
                                    ${sfxEnabled ? 'left-7' : 'left-1'}
                                `} />
                            </button>
                        </div>

                        {}
                        {showSfxAdvanced && (
                            <div className="pl-14 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        {t('settings.sound.testSfx') || 'Probar Sonidos Individuales'}
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {sfxList.map((sfx, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sfx.play()}
                                            disabled={!sfxEnabled}
                                            className={`
                                                flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-700 
                                                text-left text-xs font-bold transition-all
                                                ${sfxEnabled
                                                    ? 'hover:bg-blue-500/10 hover:border-blue-500/30 text-slate-600 dark:text-slate-300'
                                                    : 'opacity-30 cursor-not-allowed'
                                                }
                                            `}
                                        >
                                            <span className="truncate pr-1">{sfx.name}</span>
                                            <Play className="w-2.5 h-2.5 flex-shrink-0 text-blue-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                    >
                        {t('common.close') || 'Cerrar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SoundSettingsModal;
