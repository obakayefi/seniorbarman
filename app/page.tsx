import About from "@/components/About";
import Header from "@/components/ui/Header";
import BusinessCard, { IBusiness } from "@/components/widgets/BusinessCard";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const BUSINESSES: IBusiness[] = [
  {
    id: '3131414',
    title: 'Eventkng',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed',
    logo: '/ticketng-logo.png',
    color: "#E67A00"
  },
  {
    id: '31414',
    title: 'Toscana Culture',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed',
    logo: '/toscana-logo.png',
    color: "#000000"
  },
  {
    id: '99184',
    title: 'Party Park',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed',
    logo: '/party-park-logo.png',
    color: "#FDB902"
  },
  {
    id: '09031',
    title: 'Bamboo Garden',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed',
    logo: '/boo-garden-logo.png',
    color: "#08A877"
  },
  {
    id: '12131',
    title: 'acetec',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed',
    logo: '/acetec-logo.png',
    color: "#00A31E"
  },
  {
    id: '001331',
    title: 'Connect Humanity',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed',
    logo: '/connect-humanity-logo.png',
    color: "#0095D9"
  }
]

export default function Home() {
  return (
    <div className="relative">
      <section className="absolute right-0 top-0 ">
        <Link href={"/auth/login"}>
          <button className="p-4 flex gap-2 hover:opacity-90 duration-200 bg-orange-400 text-white cursor-pointer">
            Log In <User />
          </button>
        </Link>
      </section>
      <section className="flex pt-8 flex-col gap-2 items-center">
        <Image src='/logo.png' alt="logo" width={400} height={100} />
        <Header />
      </section>
      <About />
      <section className="flex ml-24 flex-col gap-4 mt-42 pb-12">
        <div>
          <h4 className="text-[#E67A00] text-4xl">Businesses</h4>
          <p className="text-[#9F9F9F]">An ecosystem with perfectly aligned services</p>
        </div>

        <section className="grid grid-cols-3 gap-x-5 gap-y-18 ">
          {BUSINESSES.map(business => <BusinessCard business={business} key={business.id} />)}

        </section>
      </section>
    </div>
  );
}
