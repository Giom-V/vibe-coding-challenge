
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface PhotoGalleryProps {
    images: string[];
    startIndex?: number;
    onClose: () => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images, startIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            } else if (event.key === 'ArrowLeft') {
                const isFirstSlide = currentIndex === 0;
                const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
                setCurrentIndex(newIndex);
            } else if (event.key === 'ArrowRight') {
                const isLastSlide = currentIndex === images.length - 1;
                const newIndex = isLastSlide ? 0 : currentIndex + 1;
                setCurrentIndex(newIndex);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentIndex, images.length, onClose]);

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Photo Gallery"
        >
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-white hover:text-gray-300 text-4xl z-50 transition-colors"
                aria-label="Close gallery"
            >
                &times;
            </button>

            <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                {images.length > 1 && (
                    <button 
                        onClick={goToPrevious} 
                        className="absolute left-2 sm:left-4 text-white p-3 sm:p-4 rounded-full bg-black bg-opacity-40 hover:bg-opacity-60 transition-colors z-50"
                        aria-label="Previous image"
                    >
                        <Icon name="fa-solid fa-chevron-left" className="w-6 h-6" />
                    </button>
                )}
                
                <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
                   <img 
                        src={images[currentIndex]} 
                        alt={`Gallery image ${currentIndex + 1} of ${images.length}`}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                </div>

                {images.length > 1 && (
                    <button 
                        onClick={goToNext} 
                        className="absolute right-2 sm:right-4 text-white p-3 sm:p-4 rounded-full bg-black bg-opacity-40 hover:bg-opacity-60 transition-colors z-50"
                        aria-label="Next image"
                    >
                        <Icon name="fa-solid fa-chevron-right" className="w-6 h-6" />
                    </button>
                )}
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
