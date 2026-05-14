"use client"
import { useEffect, useState } from 'react';

export const useDevFeatures = () => {
    const isDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'staging';

    const [features, setFeatures] = useState({
        showEnvViewer: isDev,
        showDbTag: isDev,
    });

    useEffect(() => {
        const match = document.cookie.match(/(^| )dev_features_config=([^;]+)/);
        if (match) {
            try {
                const parsed = JSON.parse(decodeURIComponent(match[2]));
                setFeatures(prev => ({ ...prev, ...parsed }));
            } catch(e) {}
        }
    }, []);

    return features;
};

export const setDevFeatureClient = (key: string, value: boolean) => {
    let config: Record<string, any> = {};
    const match = document.cookie.match(/(^| )dev_features_config=([^;]+)/);
    if (match) {
        try {
            config = JSON.parse(decodeURIComponent(match[2]));
        } catch(e) {}
    }
    config[key] = value;
    document.cookie = `dev_features_config=${encodeURIComponent(JSON.stringify(config))}; path=/; max-age=31536000`; 
};
