import React from 'react';
import { Duration } from '../types';

interface StoryFormProps {
    handleSubmit: (e: React.FormEvent) => void;
    topic: string;
    setTopic: (topic: string) => void;
    seen: string;
    setSeen: (seen: string) => void;
    duration: Duration;
    setDuration: (duration: Duration) => void;
    isLoading: boolean;
    T: {
        topicLabel: string;
        topicPlaceholder: string;
        seenLabel: string;
        seenPlaceholder: string;
        durationLabel: string;
        durationQuick: string;
        durationMedium: string;
        durationLong: string;
        button: string;
        buttonLoading: string;
    };
}

const StoryForm: React.FC<StoryFormProps> = ({ handleSubmit, topic, setTopic, seen, setSeen, duration, setDuration, isLoading, T }) => {
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
            <div className="form-group">
                <label htmlFor="duration">{T.durationLabel}</label>
                <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as Duration)}
                    aria-label={T.durationLabel}
                >
                    <option value="quick">{T.durationQuick}</option>
                    <option value="medium">{T.durationMedium}</option>
                    <option value="long">{T.durationLong}</option>
                </select>
            </div>
            <button type="submit" disabled={isLoading || !topic}>
                {isLoading && <span className="loader"></span>}
                {isLoading ? T.buttonLoading : T.button}
            </button>
        </form>
    );
};

export default StoryForm;
