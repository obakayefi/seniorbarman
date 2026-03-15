"use client"
import { useEffect, useState } from "react";

function TimeBlock({ value, label }: { value: number; label: string }) {
    return (
        <section className="flex flex-col items-center justify-center flex-1 gap-0.5 sm:gap-1">
            <span className="text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-bold tabular-nums leading-none">
                {String(value).padStart(2, "0")}
            </span>
            <span className="text-gray-500 text-[9px] xs:text-[10px] sm:text-xs md:text-sm 2xl:text-base uppercase tracking-widest whitespace-nowrap">
                {label}
            </span>
        </section>
    );
}

function Divider() {
    return (
        <div className="self-stretch w-[1px] bg-gray-300/10 mx-1 sm:mx-2 shrink-0" />
    );
}

function getTimeLeft(target: Date) {
    const now = new Date().getTime();
    const diff = new Date(target).getTime() - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
}

export default function HeroCountdown({ targetDate }: { targetDate: Date }) {
    const TARGET_DATE = new Date(targetDate).getTime();
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(new Date(TARGET_DATE)));
    const [loadingCountdown, setLoadingCountdown] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(new Date(TARGET_DATE)));
            setLoadingCountdown(false);
        }, 1000);
        return () => clearInterval(interval);
    }, [TARGET_DATE]);

    if (loadingCountdown) return <div className="h-16 sm:h-20 invisible" />;

    return (
        <div className="flex items-stretch w-full py-4 sm:py-5 lg:py-6 2xl:py-8">
            <TimeBlock value={timeLeft.days} label="Days" />
            <Divider />
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <Divider />
            <TimeBlock value={timeLeft.minutes} label="Minutes" />
            <Divider />
            <TimeBlock value={timeLeft.seconds} label="Seconds" />
        </div>
    );
}
