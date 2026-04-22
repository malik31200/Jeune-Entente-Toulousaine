import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-primary)' }} className="mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Logo + description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
              >
                JET
              </div>
              <span className="text-white font-bold">Jeune Entente Toulousaine</span>
            </div>
            <p className="text-gray-400 text-sm">
              Club de football toulousain fondé avec passion. Rejoignez l'aventure JET !
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/actualites', label: 'Actualités' },
                { href: '/equipes', label: 'Équipes' },
                { href: '/horaires', label: 'Horaires' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">
              Contact
            </h3>
            <p className="text-gray-400 text-sm mb-2">Toulouse, France</p>
            <Link
              href="/contact"
              className="inline-block text-sm font-semibold px-4 py-2 rounded transition-colors"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}
            >
              Nous contacter
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Jeune Entente Toulousaine. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
