import Image from 'next/image'
import React from 'react'
import ImgIcon from './ImgIcon'
import { FaTiktok } from "react-icons/fa6";
import { TbBrandInstagramFilled } from "react-icons/tb";

const SOCIAL_CONTACTS = [
    {
        value: "1 Aguleri Street, Independence Layout Enugu, Nigeria",
        iconLocation: "/location-pin-icon.svg",
        type: "location"
    },
    {
        value: "+2347015272791",
        url: "https://wa.link/qf8754",
        iconLocation: "/whatsapp-icon.svg",
        type: "link"
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
                            <a href={`${sContact.type === 'phone' ? 'tel': sContact.type === 'mail' ? 'mailto' : sContact.type === "link" ? sContact.url : '#'}${sContact.type === "link" ? "" : ":" + sContact.value }`} className=''>{sContact.value}</a>
                        </div>
                    ))}
                </section>
            </section>
            <section className='flex flex-col-reverse sm:flex-row py-3 items-center justify-between border-t-2 pt-2 border-[#DDDDDD]'>
                <p className='text-[#9D9D9D]'> © 2025 Copyrights. All rights reserved</p>
                <div className='flex gap-2  items-center'>
                    <FaTiktok size={24} color={"red"}/>
                    <TbBrandInstagramFilled size={32} />
                </div>
            </section>
        </div>
    )
}

export default Footer