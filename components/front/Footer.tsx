import Link from "next/link"
import { Camera, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-6 w-6 text-accent" />
              <span className="font-semibold text-xl tracking-wide">LENS & LIGHT</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-sm">
              用镜头记录世界的美好瞬间。每一张照片都是一个故事，
              每一个光影都是一段情感。
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="text-primary-foreground/60 hover:text-accent transition-colors text-xs font-medium tracking-widest"
                title="Instagram"
              >
                IG
              </a>
              <a
                href="mailto:contact@lenslight.com"
                className="text-primary-foreground/60 hover:text-accent transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm tracking-wider uppercase text-accent mb-4">
              作品
            </h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              {[
                { href: "/gallery", label: "所有作品" },
                { href: "/gallery/landscape", label: "风光摄影" },
                { href: "/gallery/portrait", label: "人像摄影" },
                { href: "/gallery/street", label: "街头摄影" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm tracking-wider uppercase text-accent mb-4">
              服务
            </h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              {[
                { href: "/services", label: "定制拍摄" },
                { href: "/orders", label: "我的订单" },
                { href: "/about", label: "关于摄影师" },
                { href: "/contact", label: "联系我们" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <p>© 2024 Lens & Light. 版权所有。</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-accent transition-colors">
              隐私政策
            </Link>
            <Link href="/terms" className="hover:text-accent transition-colors">
              服务条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
