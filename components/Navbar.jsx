

"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const Navbar = () => {
  const pathname = usePathname()

  const navItems = [
    { href: "/home", img: "/navimg/home.svg", label: "Home" },
    { href: "/workers", img: "/navimg/workers.svg", label: "Workers" },
    { href: "/clients", img: "/navimg/clients.svg", label: "Clients" },
    { href: "/jobs", img: "/navimg/jobs.svg", label: "Jobs" },
    { href: "/messages", img: "/navimg/message.svg", label: "Messages" },
    { href: "/profile", img: "/navimg/profile.svg", label: "Profile" },
  ]

  return (
    <nav className="fixed bg-amber-300 bottom-0 w-[100%] h-[10vh] lg:static lg:w-[14%] lg:m-1 lg:h-[98vh] p-2 flex lg:flex-col justify-center z-50">
      <ul className="flex flex-row lg:flex-col gap-4 lg:gap-10 w-[100%] h-full justify-center items-center lg:items-start">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <li
              key={item.href}
              className={`bg-black flex-1 lg:flex-none flex items-center justify-center lg:justify-start ${
                isActive ? "liactive" : ""
              }`}
            >
              <Link
                href={item.href}
                className="flex flex-col lg:flex-row items-center justify-center lg:justify-start w-full p-2"
              >
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-7 h-7 sm:w-7 sm:h-7"
                />
                <span className="hidden sm:block lg:ml-2 text-left">
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default Navbar







