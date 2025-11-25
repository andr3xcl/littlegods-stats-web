import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, Trophy } from 'lucide-react';
import { useGSAP } from '../../../utils/gsap';
import { MAP_BANNERS, MAP_NAME_TO_CODE } from '../../../constants';
import { MAP_NAMES } from '../../../constants/gameData';
import { useUISounds } from '../../../hooks/useUISounds';
import { useTheme } from '../../../contexts/ThemeContext';
import type { MatchData } from '../../../types';
import MatchDetails from './MatchDetails';

interface MatchDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    match: MatchData | null;
    t: (key: string) => string;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ isOpen, onClose, match, t }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const gsap = useGSAP();
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();
    const { playExit } = useUISounds();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            gsap.animateModalIn(modalRef.current);
        }
    }, [isOpen, gsap]);

    const handleClose = () => {
        playExit();
        if (modalRef.current) {
            gsap.animateModalOut(modalRef.current, onClose);
        } else {
            onClose();
        }
    };

    if (!mounted || !isOpen || !match) return null;

    
    
    const mapCode = MAP_NAME_TO_CODE[match.map] || match.map;
    const mapBanner = MAP_BANNERS[mapCode] || 'https://picsum.photos/seed/map/800/400';

    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-10 ${theme === 'dark' ? 'bg-black/95 backdrop-blur-xl' : 'bg-black/85 backdrop-blur-xl'}`}
            onClick={handleClose}
        >
            <div
                ref={modalRef}
                className={`w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col border ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-700/60' : 'bg-white border-slate-300/60'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {}
                <div className="relative shrink-0">
                    <div className="relative h-48 lg:h-64 overflow-hidden">
                        <img
                            src={mapBanner}
                            alt={MAP_NAMES[match.map]}
                            className="w-full h-full object-cover brightness-75 hover:brightness-100 transition-all duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                        {}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-110 group"
                        >
                            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        {}
                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                            {t('stats.zombies')}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-slate-300 font-medium backdrop-blur-md bg-black/20 px-2 py-0.5 rounded-full">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(match.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                                        {MAP_NAMES[match.map]}
                                    </h1>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 flex flex-col items-center min-w-[80px]">
                                    <span className="text-xs text-slate-300 uppercase font-bold tracking-wider">{t('stats.round')}</span>
                                    <span className="text-xl font-black text-white flex items-center gap-1">
                                        {match.round}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50">
                    <MatchDetails
                        match={match}
                        onViewWeapons={() => { }} 
                        t={t}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MatchDetailsModal;
