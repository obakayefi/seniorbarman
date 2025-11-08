import Image from 'next/image'
import React from 'react'
import ImgIcon from './ImgIcon'

const SOCIAL_CONTACTS = [
    {
        value: "1 Aguleri Street, Independence Layout Enugu, Nigeria",
        iconLocation: "/location-pin-icon.svg",
        type: "location"
    },
    {
        value: "+2349042433425",
        iconLocation: "/whatsapp-icon.svg",
        type: "phone"
    },
    {
        value: "seniorbarman@gmail.com",
        iconLocation: "/mail-icon.svg",
        type: "email"
    }
]

const Footer = () => {
    return (
        <div
            className='bg-[#F8F8F8] pt-10 px-6'
        >
            <section className='flex flex-col gap-20'>
                <div>
                    <Image src={'/logo-clear.svg'} height={100} width={300} alt='logo' />
                    <p className='text-[#9D9D9D]'>Top ranked entertainment and hospitality expert</p>
                </div>


                <section className="flex flex-col gap-2">
                    {SOCIAL_CONTACTS.map(sContact => (
                        <div key={sContact.value} className='flex items-center text-[#626262] gap-2'>
                            <span className='mt-2'><ImgIcon width={35} iconLocation={sContact.iconLocation} /></span>
                            <a href={`${sContact.type === 'phone' ? 'tel': sContact.type === 'mail' ? 'mailto' : '#'}:${sContact.value}`} className=''>{sContact.value}</a>
                        </div>
                    ))}
                </section>
            </section>
            <section className='flex justify-between border-t-2 pt-2 border-[#DDDDDD]'>
                <p className='text-[#9D9D9D]'> © 2025 Copyrights. All rights reserved</p>
                <div className='flex gap-2 items-center'>
                    <Image alt='social-logo' src={'/instagram-icon.svg'} height={100} width={50} />
                    <Image alt='social-logo' src={'/ig-footer-icon.svg'} height={100} width={50} />
                </div>
            </section>
        </div>
    )
}

export default Footer