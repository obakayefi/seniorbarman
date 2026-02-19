type HeaderProps = {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export const PageHeader = ({ title, description, children }: HeaderProps) => (
    <div className='flex justify-between w-full items-center'>
        <div className="flex flex-col gap-1">
            <h3 className="text-3xl text-orange-400">{title}</h3>
            {description && <p className="text-gray-400 text-sm">{description}</p>}
        </div>
        {children}
    </div>
)