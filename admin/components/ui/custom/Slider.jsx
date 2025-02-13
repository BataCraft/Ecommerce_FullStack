"use client"

import {
    Sheet,
    SheetContent,
    
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Home, HomeIcon, MenuIcon, PackageSearchIcon, Settings, ShoppingBag, User2Icon } from "lucide-react"
import useAuthStore from "@/Store/authStore"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"


const Slider = () => {
    const { user } = useAuthStore();
    const router = useRouter();

    const pathname = usePathname();

    useEffect(() => {
        if (!user) {
            router.push("/sign-in")
        }
    }, [user])




    const sidebarLinks = [
        { href: "/dashboard", Label: "Dashboard", icon: <Home /> },
        { href: "/order", Label: "Order", icon: <ShoppingBag /> },
        { href: "/customers", Label: "Customers", icon: <User2Icon /> },
        { href: "/Product", Label: "Products", icon: <PackageSearchIcon /> },
        { href: "/settings/", Label: "Setting", icon: <Settings /> },
    ]

    return (
        <div >
            

                <div className="block sm:hidden p-4">
                    <Sheet className="bg-white">
                        <SheetTrigger>
                            <MenuIcon />
                        </SheetTrigger>
                        <SheetContent side="left" className="bg-white">
                            <SheetHeader>
                                <SheetTitle>
                                    {user?.name || "Guest"}
                                </SheetTitle>

                            </SheetHeader>
                            <nav className="mt-8 flex flex-col justify-between min-h-screen">
                                <ul className="space-y-2">
                                    {sidebarLinks.map((link, index) => (
                                        <li key={index}>
                                            <Link
                                                href={link.href}
                                                className={`flex items-center gap-2 p-2 px-3 rounded-2xl transition-colors
                                            ${pathname === link.href
                                                        ? 'bg-primaryColor text-white'
                                                        : 'hover:bg-primaryColor/25'
                                                    }`}
                                            >
                                                <span className={pathname === link.href ? 'text-white' : 'text-gray-600'}>
                                                    {link.icon}
                                                </span>
                                                <span>{link.Label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                                <h1>Hello</h1>

                                <button>
                                    Logout
                                </button>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="hidden sm:block bg-white border-r border-gray-200 h-screen w-[15rem]">
                    <div className="pt-8">
                        <h1 className="text-2xl font-semibold px-4 flex items-center gap-4 mb-16"><span >
                            <Image src={'/chicken.png'} width={40} height={40} alt="chicken" />
                        </span> {user?.name || "Guest"}</h1>
                        <ul className="space-y-2 px-4">
                            {sidebarLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className={`flex items-center gap-2 p-2 px-3 rounded-2xl transition-colors
                                            ${pathname === link.href
                                                ? 'bg-primaryColor text-white'
                                                : 'hover:bg-primaryColor/25'
                                            }`}
                                    >
                                        <span className={pathname === link.href ? 'text-white' : 'text-gray-600'}>
                                            {link.icon}
                                        </span>
                                        <span>{link.Label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

 

           
        </div>
    )   
}

export default Slider