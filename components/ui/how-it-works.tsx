import {CircleCheck, CreditCard, QrCode, SearchIcon} from "lucide-react";

export default function HowItWorks() {
    return (
        <section id={'howItWorks'} className="flex text-slate-900 h-auto w-full py-15 lg:py-30 px-2 lg:px-60 flex-col lg:mb-10 ">
            <div className="flex gap-1 b text-center flex-col mb-4">
                <h2 className={'text-4xl text-white text-center'}>How It Works</h2>
                <p className={'text-slate-300'}>
                    Getting your tickets is quick and easy. Follow these simple steps to
                    secure your spot at the
                    stadium
                </p>
            </div>

            <div className={'flex sm:grid md:grid-cols-2 xl:grid-cols-4 flex-wrap justify-between gap-4 mt-6'}>
                <div className="bg-[#0B0B0E] w-full relative p-4 flex flex-col justify-between h-54 rounded-lg">
                    <div className={'h-14 w-14 shadow flex items-center mb-4 justify-center rounded-full bg-[#0E0E11]'}>
                        <SearchIcon className={'text-green-500'}/>
                    </div>
                    <p className="font-semibold text-green-400">1. Choose your Match</p>
                    <p className={'text-slate-300'}>
                        Browse upcoming Enugu Rangers home matches or events and select the
                        one you want to attend
                    </p>
                </div>

                <div className={'bg-[#0B0B0E] w-full h-54 flex flex-col justify-between p-4 rounded-lg'}>
                    <div className={'h-13 w-13 flex items-center mb-4 justify-center rounded-full bg-[#0E0E11]'}>
                        <CreditCard className={'text-green-500'}/>
                    </div>
                    <p className="font-semibold text-green-400">2. Pay Securely</p>
                    <p className={'text-slate-300'}>
                        Purchase using our secure payment options. We accept cards, bank transfers, and
                        mobile payments
                    </p>
                </div>

                <div className={'bg-[#0B0B0E] flex w-full flex-col justify-between  h-54 p-4 rounded'}>
                    <div className={'h-13 w-13 flex items-center mb-4 justify-center rounded-full bg-[#0E0E11]'}>
                        <QrCode className={'text-green-500'}/>
                    </div>
                    <p className="font-semibold text-green-400">3. Get Your QR Ticket</p>
                    <p className={'text-slate-300'}>Receive your digital ticket instantly via email and in your account.
                        No printing needed!</p>
                </div>

                <div className={'bg-[#0B0B0E] flex w-full flex-col justify-between h-54 p-4 rounded'}>
                    <div className={'h-13 w-13 flex items-center mb-4 shadow-xl justify-center rounded-full bg-[#0E0E11]'}>
                        <CircleCheck className={'text-green-500'}/>
                    </div>
                    <p className="font-semibold text-green-400">4. Scan & Enter</p>
                    <p className={'text-slate-300'}>Receive your digital ticket instantly via email and in your account.
                        No printing needed!</p>
                </div>
            </div>
        </section>
    )
}