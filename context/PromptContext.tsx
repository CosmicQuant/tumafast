
import React, { createContext, useContext, useState, ReactNode } from 'react';
import PromptModal, { PromptType } from '../components/PromptModal';

interface PromptOptions {
    title: string;
    message: string;
    type: PromptType;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
}

interface PromptContextType {
    showPrompt: (options: PromptOptions) => void;
    showAlert: (title: string, message: string, type?: PromptType) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void, type?: PromptType) => void;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const PromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [options, setOptions] = useState<PromptOptions | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const showPrompt = (opt: PromptOptions) => {
        setOptions(opt);
        setIsOpen(true);
    };

    const showAlert = (title: string, message: string, type: PromptType = 'info') => {
        showPrompt({ title, message, type });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, type: PromptType = 'confirm') => {
        showPrompt({
            title,
            message,
            type,
            onConfirm: () => {
                onConfirm();
                setIsOpen(false);
            }
        });
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <PromptContext.Provider value={{ showPrompt, showAlert, showConfirm }}>
            {children}
            {options && (
                <PromptModal
                    isOpen={isOpen}
                    onClose={handleClose}
                    {...options}
                />
            )}
        </PromptContext.Provider>
    );
};

export const usePrompt = () => {
    const context = useContext(PromptContext);
    if (context === undefined) {
        throw new Error('usePrompt must be used within a PromptProvider');
    }
    return context;
};
