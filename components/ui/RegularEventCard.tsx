import NButton from "../native/NButton";
import { SlLocationPin } from "react-icons/sl";

export default function RegularEventCard() {
    return (
        <section className="w-full rounded-xl border-[1.5px] border-zinc-900 overflow-hidden group transition-shadow duration-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:border-zinc-800">
            <div className="bg-zinc-800 overflow-hidden">
                <img src="https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024" alt="" className='w-full h-62 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110' />
            </div>
            <div className="p-2 py-6 flex flex-col gap-8 text-zinc-100 bg-zinc-950 px-6">
                <section className="flex flex-col gap-2">
                    <h2 className="text-xl">Emerald Nights: Rooftop Rave</h2>
                    <p className="flex items-center gap-2 text-sm text-zinc-600"><span><SlLocationPin /></span> Villa Toscana, Independence Layout</p>
                </section>
                <section className="flex w-full items-end justify-between">
                    <div className="">
                        <span className="text-xs text-zinc-600">STARTING FROM</span>
                        <p className="text-3xl text-green-400 font-semibold">₦5,000</p>
                    </div>
                    <NButton className="bg-green-800">BUY TICKETS</NButton>
                </section>
            </div>
        </section>
    )
}