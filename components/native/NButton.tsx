import { MouseEventHandler } from 'react';
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner';

type Props = {
    loading?: boolean;
    disabled?: boolean;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
    iconClassName?: string;
}

const NButton = ({ disabled, loading, onClick, children, className, icon, iconClassName }: Props) => {
    return (
        <Button onClick={onClick} disabled={disabled} className={`py-1 px-3 disabled:bg-slate-400 cursor-pointer ${className}`}>
            {children} <div className={iconClassName}>{loading ? <Spinner /> : icon}</div>
        </Button>
    )
}

export default NButton