import Image from 'next/image'

type Props = {
    iconLocation: string;
    onClick?: () => void;
    classNames?: string;
    width?: number
}

const ImgIcon = ({ iconLocation, onClick, classNames, width = 25 }: Props) => {
    return (
        <Image
            onClick={onClick}
            src={iconLocation}
            alt='icon'
            className={classNames}
            height={100}
            width={width}
        />
    )
}

export default ImgIcon