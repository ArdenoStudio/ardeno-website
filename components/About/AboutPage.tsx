import React from 'react';

export const AboutPage: React.FC<{ onOpenContact: () => void }> = ({ onOpenContact }) => {
    return (
        <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">About Ardeno Studio</h1>
            <p className="text-zinc-400 text-lg mb-8">
                We are a digital product studio crafting exceptional web experiences and branding solutions. Our new About page is coming soon.
            </p>
            <button
                onClick={onOpenContact}
                className="px-8 py-3 bg-white text-black font-medium rounded hover:bg-zinc-200 transition-colors"
            >
                Get in Touch
            </button>
        </div>
    );
};
