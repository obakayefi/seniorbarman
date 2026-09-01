import Image from 'next/image'
import React from 'react'
import ImgIcon from './ImgIcon'
import { FaTiktok } from "react-icons/fa6";
import { TbBrandInstagramFilled } from "react-icons/tb";
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
            className='bg-card dark:bg-[#0E0E11] text-muted-foreground dark:text-gray-400 flex flex-col pt-16 pb-8 px-6 border-t border-border dark:border-zinc-900 transition-colors'
        >
            <section className="max-w-7xl mx-auto w-full flex flex-col gap-12">
                <div className={'flex flex-col lg:flex-row justify-between gap-12 lg:gap-8'}>
                    {/* Logo and Description */}
                    <section className='flex flex-col gap-6 w-full lg:max-w-sm'>
                        <div className='flex flex-col gap-4'>
                            <Image src={'/logo-clear.svg'} height={100} width={220} alt='logo' className="opacity-90 dark:invert-0 invert transition-all" />
                            <p className='text-muted-foreground dark:text-zinc-400 font-medium text-sm'>Top ranked entertainment and hospitality expert</p>
                        </div>
                        <p className='text-muted-foreground dark:text-zinc-500 leading-relaxed'>
                            Nigeria's premier ticketing platform for football matches, concerts, and entertainment events. Providing seamless access to your favorite experiences.
                        </p>

                        <div className='flex gap-4 items-center'>
                            <a href="#" className="p-2 bg-muted dark:bg-zinc-900 rounded-full hover:bg-muted/80 dark:hover:bg-zinc-800 transition-colors">
                                <FaTiktok size={20} className="text-foreground dark:text-zinc-400 hover:text-orange-500 dark:hover:text-white" />
                            </a>
                            <a href="#" className="p-2 bg-muted dark:bg-zinc-900 rounded-full hover:bg-muted/80 dark:hover:bg-zinc-800 transition-colors">
                                <TbBrandInstagramFilled size={24} className="text-foreground dark:text-zinc-400 hover:text-orange-500 dark:hover:text-white" />
                            </a>
                        </div>
                    </section>

                    {/* Quick Links */}
                    <section className='flex flex-col min-w-[150px]'>
                        <h2 className="text-lg font-bold text-foreground dark:text-white uppercase tracking-wider mb-6">Quick Links</h2>
                        <nav className={'flex flex-col gap-3'}>
                            <Link href={'/events'} className="hover:text-orange-500 transition-colors">Browse Events</Link>
                            <Link href={'/teams'} className="hover:text-orange-500 transition-colors">Teams</Link>
                            <Link href={'/u/tickets'} className="hover:text-orange-500 transition-colors">My Tickets</Link>
                            <Link href={'/auth/register'} className="hover:text-orange-500 transition-colors">Create Account</Link>
                        </nav>
                    </section>

                    {/* Contact Info */}
                    <section className='flex flex-col max-w-md'>
                        <h2 className="text-lg font-bold text-foreground dark:text-white uppercase tracking-wider mb-6">Contact Us</h2>
                        <div className={'flex flex-col gap-5'}>
                            {SOCIAL_CONTACTS.map(sContact => (
                                <div key={sContact.value} className='flex items-start gap-3 group'>
                                    <div className='mt-1 p-2 bg-muted dark:bg-zinc-900 rounded-lg group-hover:bg-muted/80 dark:group-hover:bg-zinc-800 transition-colors'>
                                        <ImgIcon
                                            width={20}
                                            iconLocation={sContact.iconLocation}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs text-muted-foreground dark:text-zinc-600 font-bold uppercase tracking-tighter mb-0.5">{sContact.type}</p>
                                        <a href={`${sContact.type === 'phone' ? 'tel' : sContact.type === 'mail' ? 'mailto' : sContact.type === "link" ? sContact.url : '#'}${sContact.type === "link" ? "" : ":" + sContact.value}`}
                                            className='text-foreground dark:text-zinc-400 hover:text-orange-500 dark:hover:text-white transition-colors break-all leading-snug lg:max-w-[250px]'>{sContact.value}</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Bottom Footer */}
                <div className={'border-t border-border dark:border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'}>
                    <p className='text-muted-foreground dark:text-zinc-600 text-sm'> © {new Date().getFullYear()} Senior Barman. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-muted-foreground dark:text-zinc-600">
                        <Link href="#" className="hover:text-foreground dark:hover:text-zinc-400 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-foreground dark:hover:text-zinc-400 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Footer