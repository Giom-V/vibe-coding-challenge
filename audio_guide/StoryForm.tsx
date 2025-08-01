
import React from 'react';

interface StoryFormProps {
    handleSubmit: (e: React.FormEvent) => void;
    topic: string;
    setTopic: (topic: string) => void;
    seen: string;
    setSeen: (seen: string) => void;
    isLoading: boolean;
    T: {
        topicLabel: string;
        topicPlaceholder: string;
        seenLabel: string;
        seenPlaceholder: string;
        button: string;
        buttonLoading: string;
    };
}

const StoryForm: React.FC<StoryFormProps> = ({ handleSubmit, topic, setTopic, seen, setSeen, isLoading, T }) => {
    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="topic">{T.topicLabel}</label>
                <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={T.topicPlaceholder}
                    required
                    aria-required="true"
                />
            </div>
            <div className="form-group">
                <label htmlFor="seen">{T.seenLabel}</label>
                <textarea
                    id="seen"
                    value={seen}
                    onChange={(e) => setSeen(e.target.value)}
                    placeholder={T.seenPlaceholder}
                />
            </div>
            <button type="submit" disabled={isLoading || !topic}>
                {isLoading && <span className="loader"></span>}
                {isLoading ? T.buttonLoading : T.button}
            </button>
        </form>
    );
};

export default StoryForm;
