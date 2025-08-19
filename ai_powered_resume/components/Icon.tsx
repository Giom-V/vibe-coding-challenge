
import React from 'react';

interface IconProps {
    name: string;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className }) => {
    return <i className={`${name} ${className || ''}`}></i>;
};
