import Navbar from "@/components/front/Navbar"
import CartDrawer from "@/components/front/CartDrawer"
import Footer from "@/components/front/Footer"

export default function FrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
