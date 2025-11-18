"use client"
import { useState } from 'react'
import Image from 'next/image'
import ImgIcon from '../ui/ImgIcon'

type CardContentProps = {
    showContent: boolean;
    toggleShowContent: () => void;
    business: IBusiness
}

const CardContent = ({ showContent, toggleShowContent, business }: CardContentProps) => {
    return (
        <>
            <section style={{ backgroundColor: business.color }} className={`relative flex mt-40 py-4 justify-between px-4 text-white`}>
                <h3 className='text-lg'>{business.title}</h3>
                <ImgIcon
                    classNames={`active:translate-y-1 hover:opacity-85 cursor-pointer ${showContent ? '' : 'rotate-180'}`}
                    onClick={toggleShowContent}
                    iconLocation='/arrow-up.svg' />
            </section>
            {showContent ? (
                <section className='bg-[#FAFAFA] p-4 border border-[#D4D4D4]' style={{ color: business.color }}>
                    <p>
                        {business.description}
                    </p>
                </section>
            ) : null}
        </>
    )
}

export interface IBusiness {
    id: string;
    title: string;
    description: string;
    logo: string;
    color: string;
}

type CardProps = {
    business: IBusiness
}

const BusinessCard = ({business}: CardProps) => {
    const [showContent, setShowContent] = useState(false)

    const toggleShowContent = () => setShowContent(_content => !_content)

    return (
        <div className={`w-96 relative group duration-300 ease-in-out transition all ${showContent ? 'max-h-auto' : 'min-h-content'}`}>
            <section className={`h-54 `} style={{ backgroundColor: business.color }}>
                
                <Image
                    className='absolute -right-5 top-5 duration-200 group-hover:top-0 group-hover:right-0'
                    src={business.logo}
                    height={100}
                    width={600}
                    alt='logo' />
            </section>

            <CardContent business={business} toggleShowContent={toggleShowContent} showContent={showContent} />
        </div>
    )
}

export default BusinessCard

