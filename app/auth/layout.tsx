import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (

        <div className='h-screen flex flex-col outline items-center gap-6 bg-[#020202] justify-center'>
            <Link href={'/'}>
                <div>
                    <Image src={'/logo-clear.svg'} alt='logo' height={100} width={300} />
                </div>
            </Link>

            <section className="w-full flex items-center justify-center">{children}</section>
        </div>
    )
}

export default Layout