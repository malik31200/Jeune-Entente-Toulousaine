'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/actualites', label: 'Actualités' },
    { href: '/equipes', label: 'Équipes' },
    { href: '/horaires', label: 'Horaires' },
    { href: '/contact', label: 'Contact' },
]

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header style={{ backgroundColor: 'var(--color-primary)' }}>
            <div className="container">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center
                            justify-center font-bold text-sm"
                            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
                        >
                            JET
                        </div>
                        <span className="text-white font-bold text-lg hidden sm:block">
                            Jeune Entente Toulousaine
                        </span>
                    </Link>

                    {/* Nav desktop */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Bouton menu mobile */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                    >
                        <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                        <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                        <div className="w-6 h-0.5 bg-white"></div>
                    </button>
                </div>

            {/* Nav mobile */}
            {menuOpen && (
                <nav className="md:hidden pb-4 flex flex-col gap-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-gray-300 hover:text-white text-sm font-medium"
                            onClick={() => setMenuOpen(false)} 
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}   
            </div>
        </header>
    )
}