import { ArrowRight, PartyPopper } from 'lucide-react'
import NButton from '../native/NButton'

export default function EventHero() {
    return (
        // <header className={'flex flex-col xl:flex-row w-full items-start justify-between'}>
        //     <section className={'flex flex-col items-center justify-start  w-full text-neutral-300'}>
        //         <h2 className={'text-6xl text-white'}>Concerts & Parties</h2>
        //         <p>Find tickets for the jottest events happening around you.</p>
        //         <p>Don't miss out on the vibe</p>
        //     </section>
        // </header>
        <header className={'flex flex-col xl:flex-row w-full items-start justify-between'}>
            <section className={'flex flex-col items-center justify-start items-start w-3/5 gap-4 text-neutral-300'}>
                <p className={'text-xs uppercase text-green-500 border px-4 border-zinc-800 bg-zinc-900 rounded-lg font-bold flex items-end gap-2 p-1.5 pb-2.5'}>
                    EXPERIENCE THE THRILL <PartyPopper />
                </p>
                <h2 className={'text-6xl letter-spacing-1 text-white'}>
                    FIND YOUR <br /> <span className='text-amber-600 text-7xl font-semibold'>NEXT</span> EVENT
                </h2>
                <p className='text-xl text-zinc-300 w-2/3'>
                    The heartbeat of Enugu's nightlife. From high-stakes Rangers matches to underground warehouse parties. Secure your batch tickets today.
                </p>

                <NButton className="bg-amber-600 text-white p-2 px-8 flex cursor-pointer hover:translate-x-2 duration-200 hover:translate-y-2 hover:bg-amber-500 items-center gap-2 rounded-full">
                    <span>Explore Now</span> <span ><ArrowRight size={18} /></span>
                </NButton>
            </section>
        </header>
    )
}