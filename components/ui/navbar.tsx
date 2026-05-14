"use client";
import React, { useEffect, useState } from "react";
import { FloatingNav } from "../ui/floating-navbar";
import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";
import {
    MobileNav,
    MobileNavHeader, MobileNavMenu, MobileNavToggle,
    Navbar,
    NavbarButton,
    NavbarLogo,
    NavBody,
    NavItems
} from "@/components/ui/resizable-navbar";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import NButton from "@/components/native/NButton";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import NotificationHub from "./NotificationHub";

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



    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const { user } = useApp();

    const navItems = [
        {
            name: "Ranger's Matches",
            link: "/rangers",
        },
        {
            name: "Events",
            link: "/events",
        },
        {
            name: "Dashboard",
            link: ((user?.role === "admin") || (user?.role === "bouncer") || (user?.role === "dev")) ? "/u/a/dashboard" : (user?.role === "organizer") ? "/u/organizer/dashboard" : "/u/dashboard",
        },
        {
            name: "How It Works",
            link: "/how-it-works",
        },
    ];

    const logUserIn = () => {
        setIsMobileMenuOpen(false)
        router.push("/auth/login")
    }

    const registerUser = () => {
        setIsMobileMenuOpen(false)
        router.push("/auth/register")
    }

    const isAuthenticated = Boolean(user?.id)

    return (
        <div className="relative z-40 text-white border-b-2 border-zinc-900 w-full">
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    {isAuthenticated ? (
                        <div className="flex items-center z-10 gap-6">
                            <NotificationHub />
                            <NButton
                                className={'cursor-pointer bg-white hover:text-zinc-400 hover:bg-zinc-800 text-zinc-900'}
                                onClick={() => router.push('/auth/logout')}>Logout</NButton>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <NavbarButton onClick={() => router.push('/auth/login')}
                                variant="secondary">Login</NavbarButton>
                            <NavbarButton
                                onClick={() => router.push('/auth/register')}
                                variant="primary"
                                className={'text-black'}>
                                Create Account
                            </NavbarButton>
                        </div>
                    )}
                </NavBody>

                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo />
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
                                className="relative text-zinc-300 bg-black"
                            >
                                <span className="block">{item.name}</span>
                            </a>
                        ))}
                        {isAuthenticated ? (
                            <div className="flex w-full flex-col gap-4">
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Alerts & System</span>
                                    <NotificationHub />
                                </div>
                                <NavbarButton
                                    onClick={() => {
                                        router.push('/auth/logout')
                                    }}
                                    variant="primary"
                                    className="w-full bg-zinc-800"
                                >
                                    Logout
                                </NavbarButton>
                            </div>
                        ) : (
                            <div className="flex w-full flex-col gap-4">
                                <NavbarButton
                                    onClick={logUserIn}
                                    variant="primary"
                                    className="w-full bg-zinc-800"
                                >
                                    Login
                                </NavbarButton>
                                <NavbarButton
                                    onClick={registerUser}
                                    variant="primary"
                                    className="w-full bg-zinc-800"
                                >
                                    Register
                                </NavbarButton>
                            </div>
                        )}
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>

        </div>
    );
}