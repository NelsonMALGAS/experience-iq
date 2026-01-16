"use client";

import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { MdOutlineHotel } from "react-icons/md";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed w-full z-50 bg-background text-foreground shadow-md transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <MdOutlineHotel className="text-shadow-muted-foreground w-8 h-8 sm:w-10 sm:h-10" />
                        <span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight hidden lg:inline-block">
                            ServiceResolve
                        </span>
                    </div>

                    {/* Desktop Menu (≥ lg) */}
                    <nav className="hidden lg:flex items-center gap-4 md:gap-6 text-base md:text-lg">
                        {/* Guest */}
                        <Link
                            href="#"
                            className="whitespace-nowrap p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                            Guest
                        </Link>

                        {/* Staff Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                                    Staff
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <Link href="#">Staff Dashboard</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="#">Staff Issue</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Manager Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                                    Manager
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <Link href="#">Manager Dashboard</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Admin Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                                    Admin
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <Link href="#">Admin Overview</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="#">Admin Properties</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="#">Admin Users</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </nav>

                    {/* Right Section: ModeToggle + Hamburger */}
                    <div className="flex items-center gap-4">
                        <ModeToggle />

                        {/* Hamburger visible on lg & below */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-foreground text-2xl focus:outline-none transition-colors"
                            >
                                {isOpen ? <HiOutlineX /> : <HiOutlineMenu />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile + Tablet Menu */}
            {isOpen && (
                <nav className="lg:hidden bg-background px-4 sm:px-6 py-4 space-y-3 text-base sm:text-lg transition-colors">
                    <Link
                        href="#"
                        onClick={() => setIsOpen(false)}
                        className="block hover:text-accent transition-colors"
                    >
                        Guest
                    </Link>

                    {/* Staff Group */}
                    <div className="space-y-1">
                        <span className="block font-semibold">Staff</span>
                        <Link
                            href="#"
                            onClick={() => setIsOpen(false)}
                            className="block pl-4 hover:text-accent transition-colors"
                        >
                            Staff Dashboard
                        </Link>
                        <Link
                            href="#"
                            onClick={() => setIsOpen(false)}
                            className="block pl-4 hover:text-accent transition-colors"
                        >
                            Staff Issue
                        </Link>
                    </div>

                    {/* Manager Group */}
                    <div className="space-y-1">
                        <span className="block font-semibold">Manager</span>
                        <Link
                            href="#"
                            onClick={() => setIsOpen(false)}
                            className="block pl-4 hover:text-accent transition-colors"
                        >
                            Manager Dashboard
                        </Link>
                    </div>

                    {/* Admin Group */}
                    <div className="space-y-1">
                        <span className="block font-semibold">Admin</span>
                        <Link
                            href="#"
                            onClick={() => setIsOpen(false)}
                            className="block pl-4 hover:text-accent transition-colors"
                        >
                            Admin Overview
                        </Link>
                        <Link
                            href="#"
                            onClick={() => setIsOpen(false)}
                            className="block pl-4 hover:text-accent transition-colors"
                        >
                            Admin Properties
                        </Link>
                        <Link
                            href="#"
                            onClick={() => setIsOpen(false)}
                            className="block pl-4 hover:text-accent transition-colors"
                        >
                            Admin Users
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Header;
