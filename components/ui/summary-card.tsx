
type SummaryCardType = {
    title: string;
    value: number;
    icon: React.ReactNode
}
export const SummaryCard = ({ title, value, icon }: SummaryCardType) => (
    <div className='flex w-full flex-col flex-row border-2 border-gray-200 flex lg:h-22 w-full justify-between items-center rounded-lg px-1 lg:px-6 pr-3 gap-6 text-slate-700'>
        <div className='border-2 h-12 w-12 lg:w-16 lg:h-16 bg-slate-800 text-slate-200 items-center justify-center rounded-lg flex'>
            {icon}
        </div>
        <div className="text-right w-2/4 lg:w-3/4">
            <h2 className='text-slate-500'>{title}</h2>
            <p className='text-3xl'>{value?.toLocaleString('en-US')}</p>
        </div>
    </div>
)