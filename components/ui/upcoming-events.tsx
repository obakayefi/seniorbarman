import { Calendar, Calendar1Icon, Clock, MapPin, Music } from "lucide-react";
import Image from "next/image";
import NButton from "@/components/native/NButton";

export default function UpcomingEvents() {
    return (
        <section className={'px-4 lg:px-60 my-20'} id={'upcomingEvents'}>
            <div className={'flex flex-col'}>
                <h4 className={'bg-rose-500 flex items-center gap-1 max-w-fit px-2 rounded-sm py-1 text-xs text-white'}><Music size={13} /> Special Event</h4>
                <h2 className={'text-3xl font-bold text-foreground'}>Featured Event</h2>
            </div>

            <div className={'bg-card border border-border flex flex-col mt-10 lg:grid grid-cols-2 overflow-hidden rounded-sm gap-2 shadow-sm'}>

                <section style={{ backgroundImage: 'url(/party-bg.png)' }} className={'bg-center bg-cover bg-no-repeat'}>
                    <Image className={'lg:hidden flex'} src={'/party-bg.png'} width={900} objectFit={'cover'} alt={'Event Poster'} height={100} />
                </section>

                <section className={'flex flex-col gap-4 px-5 py-5'}>
                    <h4 className={'bg-rose-500 flex items-center gap-1 max-w-fit px-2 rounded-sm py-1 text-xs text-white'}>February 2026</h4>
                    <div>
                        <h2 className={'text-3xl font-bold text-foreground'}>Party in the Park</h2>
                        <p className={'text-muted-foreground'}>Join us for the biggest outdoor party of the year! Live music, great food, and an unforgettable atmosphere. Bring your friends and family for a day of fun and celebration</p>
                    </div>

                    <div className={'flex flex-col gap-4'}>
                        <section className={'text-muted-foreground'}>
                            <p className={'flex gap-1 items-center'}><Calendar1Icon className={'text-rose-500'} size={14} /> <span>Sunday, February 16, 2026</span></p>
                            <p className={'flex gap-1 items-center'}><MapPin className={'text-rose-500'} size={14} /> Unity Park, Enugu</p>
                        </section>

                        <section>
                            <h3 className={'text-muted-foreground text-sm'}>Tickets from</h3>
                            <span className={'text-3xl font-semibold text-rose-500'}>N5,000</span>
                        </section>
                    </div>

                    <div className={'flex gap-6 items-center'}>
                        <NButton className={'bg-rose-500 hover:bg-rose-600 text-white rounded-sm'}>Get Tickets</NButton>
                        <NButton className={'bg-muted hover:bg-muted/80 text-foreground border border-border rounded-sm'}>Learn More</NButton>
                    </div>
                </section>
            </div>
        </section>
    )
}