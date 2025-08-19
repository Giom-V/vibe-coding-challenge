

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ExperienceSection } from './components/ExperienceSection';
import { SkillsSection } from './components/SkillsSection';
import { EducationSection } from './components/EducationSection';
import { TalksSection } from './components/TalksSection';
import { InterestsSection } from './components/InterestsSection';
import { CertificationsSection } from './components/CertificationsSection';
import { ValuesSection } from './components/ValuesSection';
import { Modal } from './components/Modal';
import { JobAnalysisModal } from './components/JobAnalysisModal';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { GlobalAskButton } from './components/GlobalAskButton';
import { Icon } from './components/Icon';
import { PhotoGallery } from './components/PhotoGallery';
import { LocaleProvider, useLocale } from './context/LocaleContext';

import { Profile, Experience, Education, Talk, ModalInfo, TooltipTerm, Skill, Value } from './types';
import { findTalks, getRelatedLinks, translateJsonData, analyzeJobRelevance } from './services/geminiService';
import { logInteraction } from './services/trackingService';

/**
 * A self-contained notification component for displaying errors and success messages.
 */
const Notification: React.FC<{
    message: string;
    type: 'error' | 'success';
    onClose: () => void;
}> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto-dismiss after 5 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    const baseClasses = "fixed top-5 left-1/2 -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg flex items-center gap-4 animate-slide-down max-w-md w-[90%]";
    const typeClasses = {
        error: "bg-red-100 border border-red-400 text-red-700",
        success: "bg-green-100 border border-green-400 text-green-700"
    };
    const icon = {
        error: "fa-solid fa-circle-exclamation",
        success: "fa-solid fa-check-circle"
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            <Icon name={icon[type]} />
            <span className="flex-grow">{message}</span>
            <button onClick={onClose} className="ml-auto -mr-1 -my-1 p-1 rounded-md hover:bg-black hover:bg-opacity-10" aria-label="Close notification">
                <Icon name="fa-solid fa-times" />
            </button>
            <style>{`
                @keyframes slide-down {
                    from { top: -100px; opacity: 0; }
                    to { top: 20px; opacity: 1; }
                }
                .animate-slide-down {
                    animation: slide-down 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};


/**
 * Converts various Google Drive share URLs to a direct, embeddable image URL.
 */
const formatGoogleDriveUrl = (url: string): string => {
    let fileId: string | null = null;
    const fileLinkMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileLinkMatch && fileLinkMatch[1]) fileId = fileLinkMatch[1];
    if (!fileId) {
        const ucLinkMatch = url.match(/drive\.google\.com\/uc\?.*?id=([a-zA-Z0-9_-]+)/);
        if (ucLinkMatch && ucLinkMatch[1]) fileId = ucLinkMatch[1];
    }
    return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
};

const AppContent: React.FC<{
    profile: Profile;
    experiences: Experience[];
    education: Education[];
    talks: Talk[];
    tooltips: TooltipTerm[];
    openModal: (info: ModalInfo) => void;
    openGlobalModal: () => void;
    openGallery: (images: string[], startIndex: number) => void;
    openTooltipModal: (term: string) => void;
    isTailoredView: boolean;
    setIsAnalysisModalOpen: (isOpen: boolean) => void;
    handleResetView: () => void;
    isDetailedView: boolean;
    setIsDetailedView: (isDetailed: boolean) => void;
}> = (props) => {
    const { t } = useLocale();
    const { profile, experiences, education, talks, tooltips, openModal, openGlobalModal, openGallery, openTooltipModal, isTailoredView, setIsAnalysisModalOpen, handleResetView, isDetailedView, setIsDetailedView } = props;
    
    return (
        <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 lg:mt-0">
                <Header profile={profile} onImageClick={openGallery} tooltipData={tooltips} onTellMeMore={openTooltipModal} />
                <div className="lg:col-span-2 grid grid-cols-1 2xl:grid-cols-2 gap-8">
                    {/* --- Main Experience Column --- */}
                    <div>
                        <ExperienceSection experiences={experiences} onAskGemini={openModal} tooltipData={tooltips} onTellMeMore={openTooltipModal} isDetailed={isDetailedView} onToggleDetailedView={setIsDetailedView} isTailoredView={isTailoredView} />
                    </div>

                    {/* --- Secondary Info Column --- */}
                    <div className="space-y-8">
                        {profile.values && <ValuesSection values={profile.values} onAskGemini={openModal} />}
                        <SkillsSection skills={profile.skills} tooltipData={tooltips} onTellMeMore={openTooltipModal} />
                        <EducationSection education={education} onAskGemini={openModal} tooltipData={tooltips} onTellMeMore={openTooltipModal} isDetailed={isDetailedView} onToggleDetailedView={setIsDetailedView} isTailoredView={isTailoredView} />
                        <TalksSection talks={talks} />
                        <InterestsSection interests={profile.interests} />
                        <CertificationsSection certifications={profile.certifications} />
                    </div>
                </div>
            </div>
            {isTailoredView ? (
                 <button
                    onClick={handleResetView}
                    className="fixed bottom-24 right-6 bg-gradient-to-r from-rose-600 to-orange-600 text-white font-bold py-4 px-6 rounded-full shadow-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 z-40 flex items-center gap-3"
                    aria-label={t('tailor_resume.reset_button_label')}
                >
                    <Icon name="fa-solid fa-times" className="text-2xl" />
                    <span className="text-lg hidden sm:inline">{t('tailor_resume.reset_button_label')}</span>
                </button>
            ) : (
                <button
                    onClick={() => setIsAnalysisModalOpen(true)}
                    className="fixed bottom-24 right-6 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 px-6 rounded-full shadow-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 z-40 flex items-center gap-3"
                    aria-label={t('tailor_resume.button_label')}
                >
                    <Icon name="fa-solid fa-wand-magic-sparkles" className="text-2xl" />
                    <span className="text-lg hidden sm:inline">{t('tailor_resume.button_label')}</span>
                </button>
            )}
            <GlobalAskButton onClick={openGlobalModal} />
        </main>
    );
};


const App: React.FC = () => {
    const originalData = useRef<{ profile: Profile | null; experiences: Experience[]; education: Education[]; talks: Talk[]; tooltips: TooltipTerm[]; localeStrings: any | null; }>({ profile: null, experiences: [], education: [], talks: [], tooltips: [], localeStrings: null });
    const [profile, setProfile] = useState<Profile | null>(null);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Education[]>([]);
    const [talks, setTalks] = useState<Talk[]>([]);
    const [tooltips, setTooltips] = useState<TooltipTerm[]>([]);
    const [localeStrings, setLocaleStrings] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState<ModalInfo | null>(null);
    const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
    const [globalModalInfo, setGlobalModalInfo] = useState<ModalInfo | null>(null);
    const [galleryState, setGalleryState] = useState<{isOpen: boolean; images: string[]; startIndex: number}>({ isOpen: false, images: [], startIndex: 0 });
    const [isTranslating, setIsTranslating] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

    // State for Job Analysis feature
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isTailoredView, setIsTailoredView] = useState(false);
    const [isDetailedView, setIsDetailedView] = useState(true);

    useEffect(() => {
        const loadAppData = async () => {
            const [profileRes, experienceRes, educationRes, talksRes, localeRes, tooltipRes] = await Promise.all([
                fetch('./data/profile.json'), fetch('./data/experience.json'), fetch('./data/education.json'),
                fetch('./data/talks.json'), fetch('./locales/en.json'), fetch('./data/tooltips.json')
            ]);
            let profileData: Profile = await profileRes.json();
            const experienceData: Experience[] = await experienceRes.json();
            const educationData: Education[] = await educationRes.json();
            const initialTalksData: Talk[] = await talksRes.json();
            const localeData = await localeRes.json();
            const tooltipData: TooltipTerm[] = await tooltipRes.json();
            
            profileData = { ...profileData, images: profileData.images.map(formatGoogleDriveUrl), conferenceImages: (profileData.conferenceImages || []).map(formatGoogleDriveUrl) };

            originalData.current = { profile: profileData, experiences: experienceData, education: educationData, talks: initialTalksData, tooltips: tooltipData, localeStrings: localeData };
            
            setProfile(profileData);
            setEducation(educationData);
            setTalks(initialTalksData);
            setExperiences(experienceData);
            setTooltips(tooltipData);
            setLocaleStrings(localeData);

            const enhanceDataWithGemini = async () => {
                try {
                    const fetchedTalks = await findTalks("Guillaume Vernade");
                    if (fetchedTalks.length > 0) {
                        const mergedTalks = [...fetchedTalks, ...initialTalksData].filter((v, i, a) => a.findIndex(t => (t.title === v.title && t.event === v.event)) === i);
                        setTalks(mergedTalks);
                        originalData.current.talks = mergedTalks;
                    }
                } catch (error) { console.error("Failed to fetch talks on startup:", error); }
            };
            enhanceDataWithGemini();
        };
        loadAppData();
    }, []);

    useEffect(() => {
        if (profile && experiences.length > 0 && education.length > 0) {
            const valuesContext = profile.values ? `\n\nMY VALUES:\n${profile.values.map(v => `- ${v.name}: ${v.summary} (Additional context for AI: ${v.details})`).join('\n')}` : '';
            const resumeContext = `PROFILE:\n${profile.name} - ${profile.title} at ${profile.company}\nBio: ${profile.bio.join(' ')}\n\nEXPERIENCE:\n${experiences.map(exp => `- ${exp.role} at ${exp.company} (${exp.period}): ${exp.summary}${(exp.keyAchievements || []).length > 0 ? `\n  Key Achievements:\n${exp.keyAchievements.map(a => `    • ${a}`).join('\n')}` : ''}`).join('\n\n')}\n\nEDUCATION:\n${education.map(edu => `- ${edu.degree} from ${edu.institution} (${edu.period}): ${edu.summary}`).join('\n')}\n\nSKILLS:\nTechnical: ${profile.skills.technical.map(s => s.name).join(', ')}\nLanguages: ${profile.skills.languages.map(s => s.name).join(', ')}\nManagement: ${profile.skills.management.map(s => s.name).join(', ')}${valuesContext}`;
            setGlobalModalInfo({ title: "modal.ask_anything_title", context: resumeContext, prompts: [ { text: 'prompts.why_hire', type: 'personal' }, { text: 'prompts.remote_work', type: 'personal' }, { text: 'prompts.experience_with', type: 'personal', fillIn: true }, { text: 'prompts.good_fit_for', type: 'personal', fillIn: true } ] });
        }
    }, [profile, experiences, education]);

    const handleLanguageChange = async (language: string) => {
        const { profile: oProfile, experiences: oExperiences, education: oEducation, talks: oTalks, localeStrings: oLocaleStrings, tooltips: oTooltips } = originalData.current;
        if (!oProfile || !oLocaleStrings) return;

        if (language.toLowerCase() === 'english') {
            setProfile(oProfile); setExperiences(oExperiences); setEducation(oEducation); setTalks(oTalks); setLocaleStrings(oLocaleStrings); setTooltips(oTooltips);
            return;
        }

        setIsTranslating(true);
        try {
            // Only include fields with user-facing text that needs translation.
            // Exclude keys, technical terms, URLs, icon names, etc.
            const contentToTranslate = {
                ui: oLocaleStrings,
                tooltips: oTooltips.map(t => ({ definition: t.definition })),
                profile: {
                    title: oProfile.title,
                    bio: oProfile.bio,
                    interests: {
                        sports: oProfile.interests.sports,
                        travelling: oProfile.interests.travelling,
                        other: oProfile.interests.other.map(o => ({ name: o.name }))
                    },
                    certifications: oProfile.certifications.map(c => ({ name: c.name })),
                    values: (oProfile.values || []).map(v => ({ summary: v.summary }))
                },
                experiences: oExperiences.map(e => ({
                    role: e.role,
                    location: e.location,
                    summary: e.summary,
                    description: e.description,
                    keyAchievements: e.keyAchievements
                })),
                education: oEducation.map(e => ({
                    degree: e.degree,
                    summary: e.summary,
                    description: e.description
                })),
                talks: oTalks.map(t => ({
                    title: t.title,
                    event: t.event,
                    location: t.location
                }))
            };

            const translatedContent = await translateJsonData(contentToTranslate, language);
            
            // Reconstruct the state with translated content, preserving non-translated data
            const newProfile = JSON.parse(JSON.stringify(oProfile));
            newProfile.title = translatedContent.profile.title;
            newProfile.bio = translatedContent.profile.bio;
            newProfile.interests.sports = translatedContent.profile.interests.sports;
            newProfile.interests.travelling = translatedContent.profile.interests.travelling;
            newProfile.interests.other.forEach((item: any, index: number) => {
                item.name = translatedContent.profile.interests.other[index].name;
            });
            newProfile.certifications.forEach((cert: any, index: number) => {
                cert.name = translatedContent.profile.certifications[index].name;
            });
            if (newProfile.values) {
                newProfile.values.forEach((val: any, index: number) => {
                    val.summary = translatedContent.profile.values[index].summary;
                });
            }

            const newExperiences = oExperiences.map((exp, i) => ({ ...exp, ...translatedContent.experiences[i] }));
            const newEducation = oEducation.map((edu, i) => ({ ...edu, ...translatedContent.education[i] }));
            const newTalks = oTalks.map((talk, i) => ({ ...talk, ...translatedContent.talks[i] }));
            const newTooltips = oTooltips.map((tooltip, i) => ({ ...tooltip, definition: translatedContent.tooltips[i].definition }));

            setLocaleStrings(translatedContent.ui);
            setProfile(newProfile);
            setExperiences(newExperiences);
            setEducation(newEducation);
            setTalks(newTalks);
            setTooltips(newTooltips);

        } catch (error) {
            console.error("Failed to translate content:", error);
            const { t } = useLocale();
            const errorMessage = t('app.translation_error', { language });
            setNotification({ message: errorMessage, type: 'error' });
        } finally {
            setIsTranslating(false);
        }
    };

    const handleAnalyzeJob = async (jobDescription: string) => {
        // Deep copy original data to prevent mutation of the ref
        const oProfile = originalData.current.profile ? JSON.parse(JSON.stringify(originalData.current.profile)) : null;
        const oExperiences = JSON.parse(JSON.stringify(originalData.current.experiences));
        const oEducation = JSON.parse(JSON.stringify(originalData.current.education));

        if (!oProfile || oExperiences.length === 0 || oEducation.length === 0) return;

        setIsAnalyzing(true);
        try {
            const analysis = await analyzeJobRelevance(jobDescription, {
                profile: oProfile,
                experiences: oExperiences,
                education: oEducation,
                values: oProfile.values || []
            });

            logInteraction({
                type: 'resume_tailoring',
                source: 'tailor_resume_modal',
                prompt: jobDescription,
                response: analysis,
            });

            const tailoredExperiences = oExperiences.map(exp => {
                const match = analysis.tailoredExperiences.find(a => a.company === exp.company && a.role === exp.role);
                if (match) {
                    return {
                        ...exp,
                        summary: match.tailoredSummary,
                        description: match.tailoredDescription,
                        analysis: { justification: match.justification }
                    };
                }
                return { ...exp, analysis: undefined };
            });

            const tailoredEducation = oEducation.map(edu => {
                const match = analysis.tailoredEducation.find(a => a.institution === edu.institution && a.degree === edu.degree);
                if (match) {
                    return {
                        ...edu,
                        summary: match.tailoredSummary,
                        description: match.tailoredDescription,
                        analysis: { justification: match.justification }
                    };
                }
                return { ...edu, analysis: undefined };
            });

            const newProfile: Profile = {
                ...oProfile,
                bio: analysis.tailoredBio,
            };

            const skillCategories: (keyof Profile['skills'])[] = ['technical', 'languages', 'management'];
            skillCategories.forEach(category => {
                 newProfile.skills[category] = newProfile.skills[category].map((skill: Skill) => {
                    const match = analysis.relevantSkills.find(rs => rs.name === skill.name);
                    if (match) {
                        return { ...skill, analysis: { justification: match.justification } };
                    }
                    return { ...skill, analysis: undefined };
                 });
            });
            
            if (newProfile.values && analysis.tailoredValues) {
                newProfile.values = newProfile.values.map(value => {
                    const match = analysis.tailoredValues.find(tv => tv.name === value.name);
                    if (match) {
                        return { ...value, summary: match.tailoredSummary, analysis: { justification: match.justification } };
                    }
                    return { ...value, analysis: undefined };
                });
            }

            setExperiences(tailoredExperiences);
            setEducation(tailoredEducation);
            setProfile(newProfile);
            setIsTailoredView(true);
            setIsDetailedView(false); // Switch to compact view
            setIsAnalysisModalOpen(false);

        } catch (error) {
            console.error("Failed to analyze job description:", error);
            setNotification({ message: (error as Error).message, type: 'error' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleResetView = () => {
        const { profile, experiences, education } = originalData.current;
        if (profile && experiences && education) {
            setProfile(profile);
            setExperiences(experiences);
            setEducation(education);
            setIsTailoredView(false);
            setIsDetailedView(true); // Revert to detailed view
        }
    };

    const openModal = (info: ModalInfo) => { setModalInfo(info); setIsModalOpen(true); };
    const closeModal = () => setIsModalOpen(false);
    const openGlobalModal = () => setIsGlobalModalOpen(true);
    const closeGlobalModal = () => setIsGlobalModalOpen(false);
    const openGallery = (images: string[], startIndex: number) => setGalleryState({ isOpen: true, images, startIndex });
    const closeGallery = () => setGalleryState(prev => ({ ...prev, isOpen: false }));

    const openTooltipModal = (term: string) => {
        setModalInfo({ title: 'modal.about_tooltip_title', titleReplacements: { term }, context: `The user wants to know more about the term: "${term}". The full resume context is provided below for reference if needed.\n\n${globalModalInfo?.context || ''}`, prompts: [ { text: `Explain what "${term}" is in the context of my career.`, type: 'personal', isRawText: true }, { text: `Provide a simple definition for "${term}".`, type: 'general', isRawText: true } ] });
        setIsModalOpen(true);
    };

    if (!profile || !localeStrings) {
        return ( <div className="min-h-screen flex items-center justify-center bg-gray-100"> <div className="text-xl font-semibold text-slate-700">Loading Interactive Resume...</div> </div> );
    }

    return (
        <LocaleProvider localeStrings={localeStrings}>
            <div className="min-h-screen font-sans text-gray-800 relative">
                {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
                {isTranslating && ( <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col items-center justify-center"> <Icon name="fa-solid fa-spinner" className="text-4xl text-cyan-500 animate-spin" /> <p className="mt-4 text-slate-700 text-lg">{localeStrings.app.translating || 'Translating content...'}</p> </div> )}
                <div className="absolute top-4 right-4 z-10"> <LanguageSwitcher onLanguageChange={handleLanguageChange} isTranslating={isTranslating} /> </div>
                
                <AppContent profile={profile} experiences={experiences} education={education} talks={talks} tooltips={tooltips} openModal={openModal} openGlobalModal={openGlobalModal} openGallery={openGallery} openTooltipModal={openTooltipModal} isTailoredView={isTailoredView} setIsAnalysisModalOpen={setIsAnalysisModalOpen} handleResetView={handleResetView} isDetailedView={isDetailedView} setIsDetailedView={setIsDetailedView} />
                
                {isModalOpen && modalInfo && <Modal info={modalInfo} onClose={closeModal} />}
                {isGlobalModalOpen && globalModalInfo && <Modal info={globalModalInfo} onClose={closeGlobalModal} />}
                {isAnalysisModalOpen && <JobAnalysisModal onClose={() => setIsAnalysisModalOpen(false)} onAnalyze={handleAnalyzeJob} isLoading={isAnalyzing} />}
                {galleryState.isOpen && <PhotoGallery images={galleryState.images} startIndex={galleryState.startIndex} onClose={closeGallery} />}
            </div>
        </LocaleProvider>
    );
};

export default App;