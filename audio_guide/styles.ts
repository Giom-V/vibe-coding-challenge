
export const GlobalStyles = `
    :root {
        --primary-color: #008C45; /* Italian Green */
        --secondary-color: #CD212A; /* Italian Red */
        --background-color: #f4f5f0; /* Italian White (off-white) */
        --text-color: #333;
        --light-text-color: #fff;
        --border-color: #d1d1d1;
        --card-bg-color: #ffffff;
        --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        --font-family: 'Montserrat', sans-serif;
    }
    *, *::before, *::after {
        box-sizing: border-box;
    }
    body {
        margin: 0;
        font-family: var(--font-family);
        background-color: var(--background-color);
        color: var(--text-color);
        line-height: 1.6;
    }
    .visually-hidden {
        border: 0;
        clip: rect(0 0 0 0);
        height: 1px;
        margin: -1px;
        overflow: hidden;
        padding: 0;
        position: absolute;
        width: 1px;
    }
    .container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 1rem;
    }
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    h1 {
        color: var(--primary-color);
        font-size: 2rem;
        margin: 0;
    }
    .lang-switcher {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .lang-switcher label {
        color: var(--primary-color);
        font-weight: 500;
        margin-bottom: 0; /* Align with select box */
    }
    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
    }
    #language-select {
        width: auto;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        padding-left: 0.5rem;
        border-radius: 6px;
        border: 1px solid var(--border-color);
        background-color: var(--card-bg-color);
        font-family: var(--font-family);
        font-size: 1rem;
        color: var(--text-color);
    }
    main {
        background-color: var(--card-bg-color);
        padding: 2rem;
        border-radius: 12px;
        box-shadow: var(--shadow);
    }
    .form-group {
        margin-bottom: 1.5rem;
    }
    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }
    input, textarea, .form-group select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 1rem;
        font-family: var(--font-family);
        background-color: var(--card-bg-color);
        color: var(--text-color);
        transition: border-color 0.2s;
    }
    input:focus, textarea:focus, .form-group select:focus {
        outline: none;
        border-color: var(--primary-color);
    }
    textarea {
        min-height: 80px;
        resize: vertical;
    }
    button {
        width: 100%;
        padding: 0.8rem 1rem;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--light-text-color);
        background-color: var(--secondary-color);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    button:hover:not(:disabled) {
        background-color: #a51a21;
    }
    button:disabled {
        background-color: #e57373;
        cursor: not-allowed;
    }
    .story-container {
        margin-top: 2rem;
        padding: 1.5rem;
        background-color: #fdfdfd;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        min-height: 100px;
        position: relative;
    }
    .welcome-message {
        color: #777;
        text-align: center;
        padding: 2rem 0;
    }
    .loader {
        width: 24px;
        height: 24px;
        border: 3px solid var(--light-text-color);
        border-bottom-color: transparent;
        border-radius: 50%;
        display: inline-block;
        animation: rotation 1s linear infinite;
    }
    .center-loader {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        padding: 1rem;
    }
    .center-loader .loader {
         border: 3px solid var(--primary-color);
         border-bottom-color: transparent;
    }
    @keyframes rotation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .error {
        color: #d9534f;
        text-align: center;
        padding: 1rem;
    }
    .story-content {
        line-height: 1.8;
        padding-top: 2.5rem; /* Space for the absolute positioned actions */
    }
    .story-content strong {
        color: var(--primary-color);
    }
    .story-content p {
        margin-top: 0;
        margin-bottom: 1rem;
    }
    .story-content p:last-child {
        margin-bottom: 0;
    }
    .story-sources {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
    }
    .story-sources h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: var(--primary-color);
        font-size: 1.1rem;
        font-weight: 700;
    }
    .story-sources ul {
        list-style-type: disc;
        padding-left: 20px;
        margin: 0;
    }
    .story-sources li {
        margin-bottom: 0.5rem;
    }
    .story-sources a {
        color: var(--text-color);
        text-decoration: underline;
        text-decoration-color: var(--border-color);
        transition: color 0.2s, text-decoration-color 0.2s;
    }
    .story-sources a:hover {
        color: var(--secondary-color);
        text-decoration-color: var(--secondary-color);
    }
    .story-actions {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 10;
    }
    .action-button {
        padding: 0.3rem 0.7rem;
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--primary-color);
        background-color: var(--card-bg-color);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        line-height: 1.2;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        min-width: 70px; /* To prevent size shifts */
    }
    .action-button:hover:not(:disabled) {
        background-color: var(--background-color);
        border-color: var(--primary-color);
    }
    .action-button:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
    .action-button:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
    }
    .audio-player {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .audio-control-button {
        width: 36px;
        height: 36px;
        padding: 0;
        min-width: 36px;
        border-radius: 50%;
        color: var(--primary-color);
    }
    .audio-control-button:disabled {
       color: #777;
    }
    .audio-control-button svg {
        width: 20px;
        height: 20px;
    }
    .audio-loader {
        width: 18px;
        height: 18px;
        border: 2px solid currentColor;
        border-bottom-color: transparent;
        border-radius: 50%;
        display: inline-block;
        animation: rotation 1s linear infinite;
    }
    .error.audio-error-inline {
        padding: 0;
        margin: 0;
        font-size: 0.8rem;
    }
    
    /* Responsive Design */
    @media (max-width: 600px) {
        .container {
            margin: 1rem auto;
            padding: 1rem;
        }
        header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding: 0;
        }
        h1 {
            font-size: 1.8rem;
        }
        main {
            padding: 1.5rem;
            border-radius: 8px;
        }
        .story-container {
            margin-top: 1.5rem;
            padding: 1rem;
            border-radius: 8px;
        }
        .story-content {
            padding-top: 3rem; /* More space on mobile */
        }
        button {
            padding: 0.9rem 1rem;
            font-size: 1rem;
        }
        .story-actions {
            top: 0.5rem;
            right: 0.5rem;
        }
    }
`;