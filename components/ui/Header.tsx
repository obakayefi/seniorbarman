import Image from 'next/image'
import React from 'react'
import NextEvent from '../widgets/NextEvent'

const Header = () => {
    return (
        <div className='flex gap-2 h-[85vh] overflow-hidden items-center relative'>
            <section>
                <div>
                    {/* Social Tag Component */}
                    <section className='flex gap-2 bg-[#E5E5E5] p-2 rounded w-48 items-center'>
                        <a href="http://tiktok.com/seniorbarman" target="_blank" rel="noopener noreferrer">
                            <Image src='/tik-tok-icon.svg' alt='social-logo' width={20} height={100} />
                        </a>
                        <span>@seniorbarman</span>
                        <a href="http://instagram.com/seniorbarman" target="_blank" rel="noopener noreferrer">
                            <Image src='/instagram-icon.svg' alt='social-logo' width={20} height={100} />
                        </a>
                    </section>

                    {/* Quote */}
                    <span className='text-lg'>Top ranked entertainment and hospitality expert</span>
                </div>
            </section>
            <section className='pt-4'>
                <Image src='/sbarman_one.svg' alt="logo" width={400} height={100} />
            </section>
            <section>
                {/* Philosophy component */}
                <div className='bg-[#EBFFEF] flex justify-between p-2 px-4 w-72'>
                    <span><Image src='/bulb-icon.svg' alt='icon' width={25} height={100} /></span>
                    <span>PHILOSOPHY</span>
                </div>
                <Image src='/header-quote-icon.png' height={100} width={300} alt='quote-icon' />
            </section>
            <NextEvent />
        </div>
    )
}

export default Header