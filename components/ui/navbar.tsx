"use client";
import React, {useState} from "react";
import {FloatingNav} from "../ui/floating-navbar";
import {IconHome, IconMessage, IconUser} from "@tabler/icons-react";
import {
    MobileNav,
    MobileNavHeader, MobileNavMenu, MobileNavToggle,
    Navbar,
    NavbarButton,
    NavbarLogo,
    NavBody,
    NavItems
} from "@/components/ui/resizable-navbar";
import {redirect} from "next/navigation";

export default function NativeNavbar
() {
    // const navItems = [
    //     {
    //         name: "Home",
    //         link: "/",
    //         icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white"/>,
    //     },
    //     {
    //         name: "About",
    //         link: "/about",
    //         icon: <IconUser className="h-4 w-4 text-neutral-500 dark:text-white"/>,
    //     },
    //     {
    //         name: "Contact",
    //         link: "/contact",
    //         icon: (
    //             <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white"/>
    //         ),
    //     },
    // ];

    const navItems = [
        {
            name: "How It Works",
            link: "#howItWorks",
        },
        {
            name: "Matches",
            link: "#upcomingMatches",
        },
        {
            name: "Events",
            link: "#upcomingEvents",
        },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="relative bg-[#020202] text-white border-b-2 border-gray-800 w-full">
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo/>
                    <NavItems items={navItems}/>
                    <div className="flex items-center gap-4">
                        <NavbarButton onClick={() => redirect('/auth/login')} variant="secondary">Login</NavbarButton>
                        <NavbarButton onClick={() => redirect('/auth/register')} variant="primary"  className={'text-black'}>Create Account</NavbarButton>
                    </div>
                </NavBody>

                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo/>
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </MobileNavHeader>

                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    >
                        {navItems.map((item, idx) => (
                            <a
                                key={`mobile-link-${idx}`}
                                href={item.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="relative text-slate-500"
                            >
                                <span className="block">{item.name}</span>
                            </a>
                        ))}
                        <div className="flex w-full flex-col gap-4">
                            <NavbarButton
                                onClick={() => setIsMobileMenuOpen(false)}
                                variant="primary"
                                className="w-full"
                            >
                                Login
                            </NavbarButton>
                            <NavbarButton
                                onClick={() => setIsMobileMenuOpen(false)}
                                variant="primary"
                                className="w-full"
                            >
                                Book a call
                            </NavbarButton>
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>

        </div>
    );
}