import { MouseEventHandler } from 'react';
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner';

type Props = {
    loading: boolean;
    disabled: boolean;
    onClick: MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
    className: string;
    icon: React.ReactNode
}

const NButton = ({ disabled, loading, onClick, children, className, icon }: Props) => {
    return (
        <Button onClick={onClick} disabled={disabled} className={`mt-6 py-1 px-3 disabled:bg-slate-400 ${className}`}>
            {children} {loading ? <Spinner /> : icon}
        </Button>
    )
}

export default NButton