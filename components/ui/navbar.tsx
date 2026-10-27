"use client";
import React, { useEffect, useState } from "react";
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
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import NotificationHub from "./NotificationHub";
import { ROLES, ROLE_GROUPS } from "@/lib/roles";
import api from "@/lib/axios";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function NativeNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [sportsUrl, setSportsUrl] = useState("/teams");
    const [favTeamId, setFavTeamId] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useApp();

    useEffect(() => {
        const fetchFavTeam = async () => {
            try {
                let id: string | null = null;
                if (user?.id) {
                    const res = await api.get("/user/favorite-team").catch(() => null);
                    id = res?.data?.favoriteTeam?._id || res?.data?.favoriteTeam || null;
                }
                if (!id && typeof window !== "undefined") {
                    id = localStorage.getItem("favoriteTeamId");
                }
                if (id) {
                    setFavTeamId(id);
                    setSportsUrl(`/teams/${id}`);
                } else {
                    setFavTeamId(null);
                    setSportsUrl("/teams");
                }
            } catch (e) {
                setFavTeamId(null);
                setSportsUrl("/teams");
            }
        };
        fetchFavTeam();

        window.addEventListener("storage", fetchFavTeam);
        return () => window.removeEventListener("storage", fetchFavTeam);
    }, [user]);

    const navItems = [
        {
            name: "Home",
            link: "/",
        },
        {
            name: "Sports",
            link: sportsUrl,
        },
        {
            name: "Events",
            link: "/events",
        },
        ...(favTeamId ? [{
            name: "My Club",
            link: `/teams/${favTeamId}`,
        }] : []),
        {
            name: "Dashboard",
            link: ROLE_GROUPS.STAFF.includes(user?.role as any) ? "/u/a/dashboard" : (user?.role === ROLES.ORGANIZER) ? "/u/organizer/dashboard" : "/u/dashboard",
        },
        {
            name: "How It Works",
            link: "/how-it-works",
        },
    ];

    const logUserIn = () => {
        setIsMobileMenuOpen(false);
        router.push("/auth/login");
    };

    const registerUser = () => {
        setIsMobileMenuOpen(false);
        router.push("/auth/register");
    };

    const isAuthenticated = Boolean(user?.id);

    return (
        <div className="relative z-40 text-foreground border-b-2 border-border w-full">
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    {isAuthenticated ? (
                        <div className="flex items-center z-10 gap-3">
                            <ThemeToggle />
                            <NotificationHub />
                            <button
                                className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-sm text-xs transition-colors shadow-sm"
                                onClick={() => router.push('/auth/logout')}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <button
                                onClick={() => router.push('/auth/login')}
                                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold px-4 py-2 rounded-sm text-xs transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => router.push('/auth/register')}
                                className="bg-white hover:bg-zinc-200 text-zinc-900 font-bold px-4 py-2 rounded-sm text-xs transition-colors"
                            >
                                Register
                            </button>
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
                            <div className="flex w-full flex-col gap-3">
                                <div className="flex items-center justify-between px-2 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Alerts & System</span>
                                    <NotificationHub />
                                </div>
                                <button
                                    onClick={() => {
                                        router.push('/auth/logout');
                                    }}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-sm text-xs transition-colors shadow-sm"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex w-full flex-col gap-3">
                                <button
                                    onClick={logUserIn}
                                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-2.5 rounded-sm text-xs transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={registerUser}
                                    className="w-full bg-white text-zinc-900 font-bold py-2.5 rounded-sm text-xs transition-colors"
                                >
                                    Register
                                </button>
                            </div>
                        )}
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
        </div>
    );
}