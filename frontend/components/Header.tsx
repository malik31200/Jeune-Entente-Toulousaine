'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Header({ shopUrl }: { shopUrl?: string | null }) {
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

                    {/* Boutique */}
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
                </div>
            </div>
        </header>
    )
}
