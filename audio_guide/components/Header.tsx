
import React from 'react';

interface HeaderProps {
    language: 'fr' | 'en';
    setLanguage: (lang: 'fr' | 'en') => void;
    T: {
        title: string;
        language: string;
    };
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage, T }) => {
    return (
        <header>
            <h1>{T.title}</h1>
            <div className="lang-switcher">
                <label htmlFor="language-select">{T.language}:</label>
                <select 
                    id="language-select" 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                    aria-label={T.language}
                >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                </select>
            </div>
        </header>
    );
};

export default Header;
