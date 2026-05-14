"use client"
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { MdStadium } from "react-icons/md";
import { FaClock, FaUser } from "react-icons/fa6";
import { BsFillCalendarDateFill } from "react-icons/bs";
import api from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";
import { formatTime, giveLogo } from "@/lib/utils";
import { RiVerifiedBadgeFill } from "react-icons/ri";

export default function PublicApplicationView() {
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();

    const fetchApplicationDetails = async () => {
        try {
            const id = params.id;
            const { data } = await api.get(`/applications/preview/${id}`);
            setApplication(data.application);
        } catch (e) {
            console.error("Error fetching application:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchApplicationDetails();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-black text-white">
                <Spinner />
                <p className="text-zinc-500 text-sm font-medium animate-pulse">Verifying Application Pass...</p>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-6 px-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                    <span className="text-4xl">⚠️</span>
                </div>
                <div className="space-y-2">
                    <p className="text-red-400 text-xl font-black uppercase tracking-widest">Pass Not Found</p>
                    <p className="text-zinc-500 max-w-xs mx-auto">This verification link is invalid, expired, or the application has been voided.</p>
                </div>
                <button
                    onClick={() => window.location.href = '/'}
                    className="bg-zinc-900 border border-white/5 hover:border-white/10 text-white px-8 py-3 rounded-xl transition-all font-bold"
                >
                    Back to Homepage
                </button>
            </div>
        );
    }

    const { event, user, status } = application;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Immersive Header Section */}
            <div className="relative w-full overflow-hidden">
                <div
                    className="absolute inset-0 z-0 scale-110 blur-3xl opacity-30"
                    style={{
                        backgroundImage: `url(${event.image || 'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />

                <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 drop-shadow-sm">Verification Portal</span>
                        <h1 className="text-3xl sm:text-4xl font-black text-white text-center tracking-tighter italic">
                            SENIOR BARMAN
                        </h1>
                        <div className="h-1 w-12 bg-orange-500 rounded-full mt-1" />
                    </div>

                    <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl group">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                            style={{ backgroundImage: `url(${event.image || 'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                        <div className="relative z-10 p-8 sm:p-12 flex flex-col items-center text-center space-y-4">
                            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tighter uppercase italic">{event.title}</h1>

                            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                                <div className="flex items-center gap-2">
                                    <BsFillCalendarDateFill size={16} className="text-orange-500" />
                                    <p className="text-white font-bold text-sm tracking-tight">{new Date(event.date).toLocaleDateString('en-GB')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClock size={16} className="text-orange-500" />
                                    <p className="text-white font-bold text-sm tracking-tight">{event.time || 'TBA'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MdStadium size={18} className="text-orange-500" />
                                    <p className="text-white font-bold text-sm tracking-tight">{event.venue}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Info Layer */}
            <div className="max-w-2xl mx-auto px-4 pb-20 -mt-8 relative z-20">
                <div className="bg-zinc-900 border border-white/10 rounded-[40px] p-8 shadow-2xl space-y-8">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        {status === 'approved' ? (
                            <div className='flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/30 px-6 py-3 rounded-2xl'>
                                <RiVerifiedBadgeFill size={28} />
                                <span className="font-black text-lg uppercase tracking-tight">Verified Entry Pass</span>
                            </div>
                        ) : (
                            <div className='flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-6 py-3 rounded-2xl'>
                                <span className="font-black text-lg uppercase tracking-tight">{status.replace('_', ' ')}</span>
                            </div>
                        )}
                    </div>

                    {/* Applicant Info */}
                    <div className="flex flex-col items-center gap-4 py-4 border-t border-white/5">
                        {application.applicantPicture ? (
                            <div className="h-40 w-40 rounded-3xl overflow-hidden border-2 border-orange-500/30 shadow-xl">
                                <img src={application.applicantPicture} alt="Applicant" className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div className="h-32 w-32 rounded-3xl bg-zinc-800 flex items-center justify-center text-zinc-600">
                                <FaUser size={48} />
                            </div>
                        )}
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Applicant Name</p>
                            <h2 className="text-2xl font-black text-white italic">{user.firstName} {user.lastName}</h2>
                        </div>
                    </div>

                    {/* Entry Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-800/50 p-4 rounded-3xl border border-white/5 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Category</p>
                            <p className="text-white font-bold">Audition</p>
                        </div>
                        <div className="bg-zinc-800/50 p-4 rounded-3xl border border-white/5 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Pass ID</p>
                            <p className="text-white font-mono text-xs">{application._id.toString().slice(-8).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-3xl backdrop-blur-sm text-center">
                        <p className="text-zinc-400 text-xs italic">
                            "This is a verified digital entry pass for Senior Barman events. 
                            Unauthorized duplication or sharing will result in immediate voiding of access."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
