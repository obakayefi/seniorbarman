import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    typescript: {
        ignoreBuildErrors: true
    },
    images: {
        remotePatterns: [new URL('https://placehold.co/400')]
    },
    allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', "http://192.168.56.1:3000", "192.168.1.167"],
};

export default nextConfig;
