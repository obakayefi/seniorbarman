
type SummaryCardType = {
    title: string;
    value: number;
    icon: React.ReactNode
}
export const SummaryCard = ({ title, value, icon }: SummaryCardType) => (
    <div className='border-2 border-gray-200 flex h-26 w-2/3 items-center rounded-lg px-6 gap-6 text-slate-700'>
        <div className='border-2 h-12 bg-slate-800 text-slate-200 items-center justify-center rounded-lg flex w-12'>
            {icon}
        </div>
        <div>
            <h2 className='text-slate-500'>{title}</h2>
            <p className='text-3xl'>{value.toLocaleString('en-US')}</p>
        </div>
    </div>
)