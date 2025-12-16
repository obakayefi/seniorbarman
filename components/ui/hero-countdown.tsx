"use client"
import {useEffect, useState} from "react";

function TimeBlock({ value, label }: { value: number; label: string }) {
    return (
        <section className="flex flex-col items-center">
      <span className="text-xl lg:text-3xl">
        {String(value).padStart(2, "0")}
      </span>
            <span className="text-gray-600 text-xs">{label}</span>
        </section>
    );
}

function Divider() {
    return <div className="h-12 bg-gray-300/10 w-0.5" />;
}


function getTimeLeft(target: Date) {
    const now = new Date().getTime();
    const diff = target.getTime() - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
        (diff % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
}

const TARGET_DATE = new Date("2025-12-21T16:00:00");

export default function HeroCountdown() {
    const [timeLeft, setTimeLeft] = useState(() =>
        getTimeLeft(TARGET_DATE)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(TARGET_DATE));
        }, 1000);

        return () => clearInterval(interval);
    }, []);
    return (
        <div className="gap-5 items-center rounded flex pt-3">
            <TimeBlock value={timeLeft.days} label="Days" />
            <Divider />
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <Divider />
            <TimeBlock value={timeLeft.minutes} label="Minutes" />
            <Divider />
            <TimeBlock value={timeLeft.seconds} label="Seconds" />
        </div>
    )
}

// return (
//     <div className={' gap-8 items-center rounded flex pt-3'}>
//         <section className={'flex flex-col items-center'}>
//             <span className={'text-xl lg:text-3xl'}>02</span>
//             <span className={'text-gray-600 text-xs'}>Days</span>
//         </section>
//         <div className={'h-12 bg-gray-300/10 w-0.5'}/>
//         <section className={'flex flex-col items-center'}>
//             <span className={'text-xl lg:text-3xl'}>11</span>
//             <span className={'text-gray-600 text-xs'}>Hours</span>
//         </section>
//         <div className={'h-12 bg-gray-300/10 w-0.5'}/>
//         <section className={'flex flex-col items-center'}>
//             <span className={'text-xl lg:text-3xl'}>31</span>
//             <span className={'text-gray-600 text-xs'}>Minutes</span>
//         </section>
//         <div className={'h-12 bg-gray-300/10 w-0.5'}/>
//         <section className={'flex flex-col items-center'}>
//             <span className={'text-xl lg:text-3xl'}>31</span>
//             <span className={'text-gray-600 text-xs'}>Seconds</span>
//         </section>
//     </div>
// )