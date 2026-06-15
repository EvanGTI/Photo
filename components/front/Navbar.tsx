"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { ShoppingBag, Menu, X, Camera } from "lucide-react"
import { useCartStore } from "@/store/cart"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/gallery", label: "作品集" },
  { href: "/gallery/landscape", label: "风光" },
  { href: "/gallery/portrait", label: "人像" },
  { href: "/gallery/street", label: "街拍" },
  { href: "/services", label: "定制服务" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { totalItems, openCart } = useCartStore()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const isHome = pathname === "/"

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || !isHome
          ? "bg-white/95 backdrop-blur-sm border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Camera
            className={cn(
              "h-6 w-6 transition-colors",
              scrolled || !isHome ? "text-primary" : "text-white"
            )}
          />
          <span
            className={cn(
              "font-semibold text-lg tracking-wide transition-colors",
              scrolled || !isHome ? "text-primary" : "text-white"
            )}
          >
            LENS & LIGHT
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors",
                pathname === link.href
                  ? scrolled || !isHome
                    ? "text-primary"
                    : "text-white"
                  : scrolled || !isHome
                  ? "text-muted-foreground hover:text-primary"
                  : "text-white/80 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={openCart}
            className={cn(
              "relative p-2 transition-colors",
              scrolled || !isHome
                ? "text-foreground hover:text-primary"
                : "text-white/80 hover:text-white"
            )}
            aria-label="购物车"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center">
                {totalItems()}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              "md:hidden p-2 transition-colors",
              scrolled || !isHome
                ? "text-foreground"
                : "text-white"
            )}
            aria-label="菜单"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block px-6 py-3 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary bg-muted"
                  : "text-muted-foreground hover:text-primary hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
