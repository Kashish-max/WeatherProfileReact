import { Inter } from 'next/font/google'
import Home from '@/components/home/home'
import Navbar from '@/components/navbar/navbar'
import Footer from '@/components/footer/footer'

const inter = Inter({ subsets: ['latin'] })

export default function Layout() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className} main}`}
    >
      <style jsx>{`
        @media (max-width: 600px) {
          main {
            padding: 4rem 0.5rem;
          }
        }
      `}</style>
      <Navbar />
      <div className="flex w-full max-w-7xl place-items-center after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-['']">
        <Home />
      </div>
      <Footer />
    </main>
  )
}
