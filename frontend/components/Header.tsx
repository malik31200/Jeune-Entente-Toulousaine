'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/actualites', label: 'Actualités' },
    { href: '/equipes', label: 'Équipes' },
    { href: '/horaires', label: 'Entraînements' },
    { href: '/partenaires', label: 'Partenaires' },
    { href: '/contact', label: 'Contact' },
]

export default function Header({ shopUrl }: { shopUrl?: string | null }) {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <header style={{ backgroundColor: 'var(--color-primary)' }}>
            <div className="container">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <motion.img
                            src="/logo.png"
                            alt="Logo JET"
                            className="w-10 h-10 object-cover rounded-full"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                        />
                        <div className="hidden sm:block">
                            <motion.p
                                className="leading-none"
                                style={{ color: 'var(--color-accent)', fontFamily: 'GraffitiYouth', fontSize: '1.5rem' }}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.35 }}
                            >
                                La JET
                            </motion.p>
                            <motion.p
                                className="text-gray-300 text-xs leading-none mt-0.5 tracking-widest uppercase"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.55 }}
                            >
                                Jeune Entente Toulousaine
                            </motion.p>
                        </div>
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
                        {shopUrl && (
                            <a
                                href={shopUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold px-4 py-2 rounded transition-opacity hover:opacity-80"
                                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
                            >
                                Boutique
                            </a>
                        )}
                    </nav>

                    {/* Hamburger mobile */}
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
                        {shopUrl && (
                            <a
                                href={shopUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-white text-sm font-medium"
                            >
                                Boutique
                            </a>
                        )}
                    </nav>
                )}
            </div>
        </header>
    )
}
