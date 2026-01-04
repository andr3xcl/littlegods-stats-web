import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useGSAP } from '../../utils/gsap';
import { useUISounds } from '../../hooks/useUISounds';

export interface StatItem {
    id: string;
    rank: number;
    label: string;
    subLabel?: string; 
    count: number | string;
    image: string;
    color?: string; 
}

interface StatsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    items: StatItem[];
}

const StatsListModal: React.FC<StatsListModalProps> = ({ isOpen, onClose, title, icon, items }) => {
    const { theme } = useTheme();
    const { playExit } = useUISounds();
    const gsap = useGSAP();
    const modalRef = useRef<HTMLDivElement>(null);
    const hasAnimatedModal = useRef(false);

    const getThemeClasses = (classes: { light: string; dark: string }) => {
        return theme === 'dark' ? classes.dark : classes.light;
    };

    useEffect(() => {
        if (isOpen && modalRef.current && !hasAnimatedModal.current) {
            gsap.animateModalIn(modalRef.current);
            hasAnimatedModal.current = true;
        }
        if (!isOpen) {
            hasAnimatedModal.current = false;
        }
    }, [isOpen, gsap]);

    const handleClose = () => {
        playExit();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${getThemeClasses({
                light: 'bg-black/60 backdrop-blur-sm',
                dark: 'bg-black/80 backdrop-blur-sm'
            })}`}
            onClick={handleClose}
        >
            <div
                ref={modalRef}
                className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border ${getThemeClasses({
                    light: 'bg-white border-slate-200',
                    dark: 'bg-slate-900 border-slate-700'
                })}`}
                onClick={(e) => e.stopPropagation()}
            >
                {}
                <div className={`p-6 pb-4 border-b ${getThemeClasses({
                    light: 'border-slate-100 bg-slate-50/50',
                    dark: 'border-slate-800 bg-slate-800/20'
                })}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {icon}
                            <h2 className={`text-xl font-black ${getThemeClasses({
                                light: 'text-slate-900',
                                dark: 'text-white'
                            })}`}>{title}</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className={`p-2 rounded-full transition-colors ${getThemeClasses({
                                light: 'hover:bg-slate-200 text-slate-500',
                                dark: 'hover:bg-slate-800 text-slate-400'
                            })}`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {}
                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`p-3 rounded-2xl border flex items-center justify-between group transition-all duration-200 hover:scale-[1.02] ${getThemeClasses({
                                light: 'bg-slate-50 border-slate-100 hover:border-slate-200 hover:shadow-md',
                                dark: 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                            })}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-black ${item.rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        item.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                                            item.rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                                                'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                                    }`}>
                                    {item.rank}
                                </div>

                                <div className={`relative w-16 h-10 rounded-lg overflow-hidden ${getThemeClasses({
                                    light: 'bg-white',
                                    dark: 'bg-slate-900'
                                })}`}>
                                    <img
                                        src={item.image}
                                        alt={item.label}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div>
                                    <h3 className={`text-sm font-bold ${getThemeClasses({
                                        light: 'text-slate-900',
                                        dark: 'text-white'
                                    })}`}>
                                        {item.label}
                                    </h3>
                                    {item.subLabel && (
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                            {item.subLabel}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <span className={`text-lg font-black ${getThemeClasses({
                                    light: 'text-slate-900',
                                    dark: 'text-white'
                                })}`}>
                                    {item.count.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsListModal;
