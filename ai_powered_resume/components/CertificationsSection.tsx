
import React from 'react';
import { Certification } from '../types';
import { Icon } from './Icon';
import { useLocale } from '../context/LocaleContext';

interface CertificationsSectionProps {
    certifications: Certification[];
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications }) => {
    const { t } = useLocale();
    return (
        <section id="certifications" className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-slate-800">
                <Icon name="fa-solid fa-certificate" />
                {t('sections.certifications')}
            </h2>
            <div className="space-y-3">
                {certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <Icon name={cert.icon} className="text-3xl text-cyan-500 w-8 text-center" />
                        <span className="font-semibold text-slate-700">{cert.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};
