
import React from 'react';

interface AudioPlayerProps {
    src: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
    return (
        <div className="mt-4">
            <audio controls autoPlay className="w-full">
                <source src={src} type="audio/wav" />
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};
