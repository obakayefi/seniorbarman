type HeaderProps = {
    title: string;
    children: React.ReactNode;
}

export const PageHeader = ({ title, children }: HeaderProps) => (
    <div className='flex justify-between w-full'>
        <div className="flex-flex-col gap-1 border-b-3 border-gray-100">
            <h3 className="text-3xl text-orange-400">{title}</h3>
            {/* <p className="text-gray-400">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p> */}
        </div>
        {children}
    </div>
)