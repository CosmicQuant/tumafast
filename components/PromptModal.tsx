
import React from 'react';
import {
    AlertTriangle, CheckCircle, Info, XCircle,
    HelpCircle, X, ArrowRight, LogOut
} from 'lucide-react';

export type PromptType = 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'logout';

interface PromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: PromptType;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
}

const PromptModal: React.FC<PromptModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm
}) => {
    if (!isOpen) return null;

    const iconMap = {
        info: <Info className="w-10 h-10 text-blue-500" />,
        success: <CheckCircle className="w-10 h-10 text-emerald-500" />,
        warning: <AlertTriangle className="w-10 h-10 text-amber-500" />,
        error: <XCircle className="w-10 h-10 text-red-500" />,
        confirm: <HelpCircle className="w-10 h-10 text-brand-500" />,
        logout: <LogOut className="w-10 h-10 text-red-500" />
    };

    const bgMap = {
        info: 'bg-blue-500/20 border-blue-500/30',
        success: 'bg-emerald-500/20 border-emerald-500/30',
        warning: 'bg-amber-500/20 border-amber-500/30',
        error: 'bg-red-500/20 border-red-500/30',
        confirm: 'bg-brand-500/20 border-brand-500/30',
        logout: 'bg-red-500/20 border-red-500/30'
    };

    const buttonMap = {
        info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
        success: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
        warning: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20',
        error: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
        confirm: 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20',
        logout: 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`p-4 rounded-2xl ${bgMap[type]} border`}>
                            {iconMap[type]}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                                {title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
                    {(type === 'confirm' || type === 'logout' || onConfirm) && (
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm border border-gray-100"
                        >
                            {cancelLabel}
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            else onClose();
                        }}
                        className={`flex-1 px-6 py-3.5 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2 text-sm ${buttonMap[type]}`}
                    >
                        <span>{confirmLabel}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromptModal;
