import Image from 'next/image'
import React from 'react'
import NextEvent from '../widgets/NextEvent'
import { BackgroundBeams } from './background-beams'
import { NBackgroundBeamsDemo } from '../native/NBackgroundBeams'
import { BackgroundRippleEffect } from './background-ripple-effect'

const Header = () => {
    return (
        <div className='flex flex-col gap-2 relative h-screen lg:h-[85vh] bg-[url("/sbarman_one.svg")] bg-no-repeat bg-top overflow-hidden mx-1 items-center justify-between w-full pb-4 relative'>
            {/* <BackgroundRippleEffect /> */}
            <div className='w-full gap-60 h-full relative flex flex-col justify-between px-4 pt-4 items-center'>
                <section>
                    <div className='z-10'>
                        {/* Social Tag Component */}
                        <section className='flex z-10 gap-2 bg-[#E5E5E5] p-2 rounded w-48 items-center'>
                            <a href="http://tiktok.com/seniorbarman" className='subtle-pulse' target="_blank" rel="noopener noreferrer">
                                <Image src='/tik-tok-icon.svg' alt='social-logo' width={20} height={100} />
                            </a>
                            <span>@seniorbarman</span>
                            <a href="http://instagram.com/seniorbarman" className='subtle-pulse' target="_blank" rel="noopener noreferrer">
                                <Image src='/instagram-icon.svg' alt='social-logo' width={20} height={100} />
                            </a>
                        </section>

                        {/* Quote */}
                        <span className='text-lg'>Top ranked entertainment and hospitality expert</span>
                    </div>
                </section>
                <section className='absolute bounce-loop bg-white bottom-25 left-5'>
                    {/* Philosophy component */}
                    <div className='bg-[#EBFFEF] flex justify-between p-2 px-4 w-full'>
                        <span><Image src='/bulb-icon.svg' alt='icon' width={25} height={100} /></span>
                        <span>PHILOSOPHY</span>
                    </div>
                    <Image src='/header-quote-icon.png' height={100} width={300} alt='quote-icon' className='p-2' />
                </section>

            </div>

            <section className="z-20 w-full md:px-0 px-3 md:w-150">
                <NextEvent />
            </section>

        </div>
    )
}

export default Header