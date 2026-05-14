import { CircleCheck, CreditCard, QrCode, SearchIcon, CalendarCheck, Settings, Users, ClipboardList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HowItWorks() {
    return (
        <section id={'howItWorks'} className="flex text-slate-900 h-auto w-full py-15 lg:py-30 px-2 lg:px-60 flex-col lg:mb-10">
            <div className="flex gap-1 b text-center flex-col mb-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="h-px w-8 bg-orange-500/50" />
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">System Guide</span>
                    <span className="h-px w-8 bg-orange-500/50" />
                </div>
                <h2 className={'text-4xl lg:text-7xl font-black text-white text-center tracking-tight uppercase italic'}>Operational <span className="text-orange-500">Blueprint</span></h2>
                <p className={'text-slate-400 max-w-3xl mx-auto font-medium text-lg'}>
                    A comprehensive walkthrough of the Senior Barman ecosystem. Select your role below to explore detailed workflows for fans, organizers, and team staff.
                </p>
            </div>

            <Tabs defaultValue="attendee" className="w-full flex flex-col items-center">
                <TabsList className="mb-16 bg-zinc-900/80 border border-zinc-800/50 p-1.5 w-full max-w-2xl min-h-[60px] !h-auto grid grid-cols-3 rounded-2xl backdrop-blur-xl shadow-2xl">
                    <TabsTrigger 
                        value="attendee" 
                        className="py-3.5 rounded-xl text-zinc-500 data-[state=active]:bg-orange-500 data-[state=active]:text-black dark:data-[state=active]:bg-orange-500 dark:data-[state=active]:text-black font-black transition-all duration-300 hover:text-zinc-300 data-[state=active]:hover:text-black uppercase tracking-tighter text-xs sm:text-sm !h-auto"
                    >
                        Fans & Attendees
                    </TabsTrigger>
                    <TabsTrigger 
                        value="organizer" 
                        className="py-3.5 rounded-xl text-zinc-500 data-[state=active]:bg-purple-500 data-[state=active]:text-white dark:data-[state=active]:bg-purple-500 dark:data-[state=active]:text-white font-black transition-all duration-300 hover:text-zinc-300 data-[state=active]:hover:text-white uppercase tracking-tighter text-xs sm:text-sm !h-auto"
                    >
                        Organizers
                    </TabsTrigger>
                    <TabsTrigger 
                        value="team" 
                        className="py-3.5 rounded-xl text-zinc-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white font-black transition-all duration-300 hover:text-zinc-300 data-[state=active]:hover:text-white uppercase tracking-tighter text-xs sm:text-sm flex items-center justify-center gap-2 !h-auto"
                    >
                        Managers
                        <span className="hidden sm:inline-block text-[8px] bg-white/10 px-2 py-0.5 rounded-full border border-white/5 group-data-[state=active]:bg-black/20">Soon</span>
                    </TabsTrigger>
                </TabsList>

                {/* FAN TABS */}
                <TabsContent value="attendee" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={'grid grid-cols-1 sm:grid-cols-2 gap-6'}>
                        <div className="bg-[#0B0B0E] w-full relative p-6 flex flex-col justify-between h-64 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group">
                            <div className={'h-14 w-14 shadow-lg flex items-center mb-4 justify-center rounded-2xl bg-green-500/10 group-hover:scale-110 transition-transform'}>
                                <SearchIcon className={'text-green-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">1. Browse & Select</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Find upcoming Enugu Rangers matches or premium events. Select your preferred stand or ticket type.
                                </p>
                            </div>
                        </div>
                        <div className={'bg-[#0B0B0E] w-full h-64 flex flex-col justify-between p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group'}>
                            <div className={'h-14 w-14 flex items-center mb-4 justify-center rounded-2xl bg-green-500/10 group-hover:scale-110 transition-transform'}>
                                <CreditCard className={'text-green-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">2. Secure Checkout</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Pay securely via card, transfer, or USSD. Your transaction is protected by bank-grade encryption.
                                </p>
                            </div>
                        </div>
                        <div className={'bg-[#0B0B0E] flex w-full flex-col justify-between h-64 p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group'}>
                            <div className={'h-14 w-14 flex items-center mb-4 justify-center rounded-2xl bg-green-500/10 group-hover:scale-110 transition-transform'}>
                                <QrCode className={'text-green-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">3. Instant Receipt</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Your digital QR ticket is generated instantly and delivered to your email and personal dashboard.
                                </p>
                            </div>
                        </div>
                        <div className={'bg-[#0B0B0E] flex w-full flex-col justify-between h-64 p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-all group'}>
                            <div className={'h-14 w-14 flex items-center mb-4 shadow-xl justify-center rounded-2xl bg-green-500/10 group-hover:scale-110 transition-transform'}>
                                <CircleCheck className={'text-green-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">4. Review & Enter</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Access your ticket anytime in your dashboard, review match details, and scan for seamless entry.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* ORGANIZER TABS */}
                <TabsContent value="organizer" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={'grid grid-cols-1 sm:grid-cols-2 gap-6'}>
                        <div className="bg-[#0B0B0E] w-full relative p-6 flex flex-col justify-between h-64 rounded-2xl border border-purple-500/10 hover:border-purple-500/40 transition-all group">
                            <div className={'h-14 w-14 shadow-lg flex items-center mb-4 justify-center rounded-2xl bg-purple-500/10 group-hover:scale-110 transition-transform'}>
                                <CalendarCheck className={'text-purple-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">1. Event Setup</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Create regular events, set venues, and upload banners. Manage everything from one hub.
                                </p>
                            </div>
                        </div>
                        <div className={'bg-[#0B0B0E] w-full h-64 flex flex-col justify-between p-6 rounded-2xl border border-purple-500/10 hover:border-purple-500/40 transition-all group'}>
                            <div className={'h-14 w-14 flex items-center mb-4 justify-center rounded-2xl bg-purple-500/10 group-hover:scale-110 transition-transform'}>
                                <Settings className={'text-purple-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">2. Form Builder</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Vet guests with custom application forms and integrated paid registration workflows.
                                </p>
                            </div>
                        </div>
                        <div className={'bg-[#0B0B0E] flex w-full flex-col justify-between h-64 p-6 rounded-2xl border border-purple-500/10 hover:border-purple-500/40 transition-all group'}>
                            <div className={'h-14 w-14 flex items-center mb-4 justify-center rounded-2xl bg-purple-500/10 group-hover:scale-110 transition-transform'}>
                                <ClipboardList className={'text-purple-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">3. Ticket Wizard</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Generate and manage thousands of tickets for offline gate sales or bulk digital distribution.
                                </p>
                            </div>
                        </div>
                        <div className={'bg-[#0B0B0E] flex w-full flex-col justify-between h-64 p-6 rounded-2xl border border-purple-500/10 hover:border-purple-500/40 transition-all group'}>
                            <div className={'h-14 w-14 flex items-center mb-4 shadow-xl justify-center rounded-2xl bg-purple-500/10 group-hover:scale-110 transition-transform'}>
                                <Users className={'text-purple-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">4. Bouncer App</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Empower your staff with our specialized scanning app to track live check-ins and revenue.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* TEAM MANAGER TABS */}
                <TabsContent value="team" className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={'grid grid-cols-1 sm:grid-cols-2 gap-6 opacity-80'}>
                        <div className="bg-[#0B0B0E] w-full relative p-6 flex flex-col justify-between h-64 rounded-2xl border border-blue-500/10 hover:border-blue-500/40 transition-all group">
                            <div className={'h-14 w-14 shadow-lg flex items-center mb-4 justify-center rounded-2xl bg-blue-500/10 group-hover:scale-110 transition-transform'}>
                                <CalendarCheck className={'text-blue-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">1. Match Ops</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Exclusively for sports team admins. Manage home games and stadium schedules for your team.
                                </p>
                            </div>
                            <span className="absolute top-4 right-4 text-[8px] bg-blue-500 text-white px-2 py-1 rounded-full font-black uppercase">Coming Soon</span>
                        </div>
                        <div className={'bg-[#0B0B0E] w-full h-64 flex flex-col justify-between p-6 rounded-2xl border border-blue-500/10 hover:border-blue-500/40 transition-all group'}>
                            <div className={'h-14 w-14 flex items-center mb-4 justify-center rounded-2xl bg-blue-500/10 group-hover:scale-110 transition-transform'}>
                                <Settings className={'text-blue-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">2. Stand Pricing</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Configure pricing based on stadium layouts (Popular, Executive, Cover Regular).
                                </p>
                            </div>
                        </div>
                        <div className={'bg-[#0B0B0E] flex w-full flex-col justify-between h-64 p-6 rounded-2xl border border-blue-500/10 hover:border-blue-500/40 transition-all group'}>
                            <div className={'h-14 w-14 flex items-center mb-4 justify-center rounded-2xl bg-blue-500/10 group-hover:scale-110 transition-transform'}>
                                <ClipboardList className={'text-blue-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">3. Gate Batching</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Generate stadium-optimized ticket batches for physical scanning at high-traffic gates.
                                </p>
                            </div>
                        </div>
                        <div className={'bg-[#0B0B0E] flex w-full flex-col justify-between h-64 p-6 rounded-2xl border border-blue-500/10 hover:border-blue-500/40 transition-all group'}>
                            <div className={'h-14 w-14 flex items-center mb-4 shadow-xl justify-center rounded-2xl bg-blue-500/10 group-hover:scale-110 transition-transform'}>
                                <Users className={'text-blue-500'} size={28}/>
                            </div>
                            <div>
                                <p className="font-black text-white text-lg mb-2 italic uppercase">4. Fan Analytics</p>
                                <p className={'text-slate-400 text-sm leading-relaxed'}>
                                    Deep dive into matchday occupancy and demographics to optimize stadium logistics.
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="mt-8 text-center text-zinc-500 text-xs italic">
                        * Team Manager features are optimized for single-team operations and stadium-scale entry management.
                    </p>
                </TabsContent>
            </Tabs>
        </section>
    )
}