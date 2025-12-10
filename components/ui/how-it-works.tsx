import {CircleCheck, CreditCard, QrCode, SearchIcon} from "lucide-react";

export default function HowItWorks() {
    return (
        <section id={'howItWorks'} className="flex text-slate-900 h-[60vh]  py-30 px-60 flex-col mb-10 items-center">
            <div className="flex gap-1 b w-2/4 text-center flex-col mb-4">
                <h2 className={'text-4xl text-white text-center'}>How It Works</h2>
                <p className={'text-slate-300'}>
                    Getting your tickets is quick and easy. Follow these simple steps to
                    secure your spot at the
                    stadium
                </p>
            </div>

            <div className={'flex items-center gap-4 w-7/8 mt-6'}>
                <div className="bg-[#0B0B0E] w-1/4 relative p-4 flex flex-col justify-between h-54 rounded-lg">
                    <div className={'h-14 w-14 shadow flex items-center mb-4 justify-center rounded-full bg-[#0E0E11]'}>
                        <SearchIcon className={'text-green-500'}/>
                    </div>
                    <p className="font-semibold text-green-400">1. Choose your Match</p>
                    <p className={'text-slate-300'}>
                        Browse upcoming Enugu Rangers home matches or events and select the
                        one you want to attend
                    </p>
                </div>

                <div className={'bg-[#0B0B0E] h-54 flex flex-col justify-between w-1/4 p-4 rounded-lg'}>
                    <div className={'h-13 w-13 flex items-center mb-4 justify-center rounded-full bg-[#0E0E11]'}>
                        <CreditCard className={'text-green-500'}/>
                    </div>
                    <p className="font-semibold text-green-400">2. Pay Securely</p>
                    <p className={'text-slate-300'}>
                        Purchase using our secure payment options. We accept cards, bank transfers, and
                        mobile payments
                    </p>
                </div>

                <div className={'bg-[#0B0B0E] flex flex-col justify-between  w-1/4 h-54 p-4 rounded'}>
                    <div className={'h-13 w-13 flex items-center mb-4 justify-center rounded-full bg-[#0E0E11]'}>
                        <QrCode className={'text-green-500'}/>
                    </div>
                    <p className="font-semibold text-green-400">3. Get Your QR Ticket</p>
                    <p className={'text-slate-300'}>Receive your digital ticket instantly via email and in your account.
                        No printing needed!</p>
                </div>

                <div className={'bg-[#0B0B0E] w-1/4 flex flex-col justify-between h-54 p-4 rounded'}>
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