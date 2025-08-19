
import React, { createContext, useContext, ReactNode } from 'react';

interface LocaleContextType {
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children, localeStrings }: { children: ReactNode, localeStrings: any }) => {
    
    const t = (key: string, replacements?: { [key: string]: string | number }): string => {
        const keys = key.split('.');
        let value = localeStrings;
        
        try {
            for (const k of keys) {
                if (value === undefined) throw new Error(`Key '${k}' not found`);
                value = value[k];
            }
        } catch (e) {
            console.warn(`Translation key not found: ${key}`);
            return key; 
        }
        
        if (typeof value !== 'string') {
             return key;
        }

        if (replacements) {
            return Object.entries(replacements).reduce(
                (acc, [placeholder, replacementValue]) => acc.replace(`{${placeholder}}`, String(replacementValue)),
                value
            );
        }

        return value;
    };
    
    return (
        <LocaleContext.Provider value={{ t }}>
            {children}
        </LocaleContext.Provider>
    );
};

export const useLocale = () => {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
};
