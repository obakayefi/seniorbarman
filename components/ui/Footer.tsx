import Image from 'next/image'
import React from 'react'
import ImgIcon from './ImgIcon'
import {FaTiktok} from "react-icons/fa6";
import {TbBrandInstagramFilled} from "react-icons/tb";
import Link from "next/link";

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
            className='bg-[#0E0E11] text-gray-600 flex flex-col font-base pt-10 px-6'
        >
            <section className="flex flex-col gap-6">
                <div className={'flex items-start flex-col lg:flex-row gap-4'}>
                    <section className='flex flex-col gap-4 w-full lg:w-1/5'>
                        <div className='flex flex-col'>
                            <Image src={'/logo-clear.svg'} height={100} width={300} alt='logo'/>
                            <p className='text-[#9D9D9D]'>Top ranked entertainment and hospitality expert</p>
                        </div>
                        <p className='text-[#9D9D9D]'>
                            Nigeria's premier ticketing platform for football matches, concerts, and entertainment
                            events.
                        </p>


                        <div className='flex gap-2  items-center'>
                            <FaTiktok size={24} color={"red"}/>
                            <TbBrandInstagramFilled size={32}/>
                        </div>
                    </section>
                    <section
                        className='flex flex-col lg:px-6 px-1 w-full lg:w-1/6'>
                        <h2 className="text-xl text-white">Quick Links</h2>

                        <section className={'flex gap-2 mt-2 text-shadow-slate-300 flex-col'}>
                            <Link href={'#'}>Browse Events</Link>
                            <Link href={'#'}>Football Matches</Link>
                            <Link href={'#'}>Concerts</Link>
                            <Link href={'#'}>My Tickets</Link>
                        </section>
                    </section>

                    <section
                        className='flex flex-col'>
                        <h2 className="text-xl text-white ml-1">Contact Us
                        </h2>

                        <section className={'flex gap-6 flex-col'}>
                            {SOCIAL_CONTACTS.map(sContact => (
                                <div key={sContact.value} className='flex md:flex-row items-start flex-col md:items-center text-shadow-slate-300 gap-2'>
                                    <span className='mt-2'>
                                        <ImgIcon
                                            width={25}
                                            iconLocation={sContact.iconLocation}
                                        />
                                    </span>
                                    <a href={`${sContact.type === 'phone' ? 'tel' : sContact.type === 'mail' ? 'mailto' : sContact.type === "link" ? sContact.url : '#'}${sContact.type === "link" ? "" : ":" + sContact.value}`}
                                       className=''>{sContact.value}</a>
                                </div>
                            ))}
                        </section>
                    </section>

                </div>
                <div className={'border-t-2 pt-2 border-gray-900'}>
                    <p className='text-[#9D9D9D]'> © 2025 Copyrights. All rights reserved</p>
                </div>
            </section>
        </div>
    )
}

export default Footer