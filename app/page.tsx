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
    description: 'This is a robust, versatile digital ticketing platform designed to manage and facilitate ticket sales for a wide spectrum of events, from major concerts (e.g., a Davido performance) to local sports matches like those hosted by Rangers FC. The platform caters to both individual consumers and large-scale resellers. We empower resellers to purchase tickets in bulk (e.g., up to 20,000 units), instantly download them as printable PDFs, and efficiently manage their sales, providing a seamless and flexible solution for event access.',
    logo: '/ticketng-logo.png',
    color: "#E67A00"
  },
  {
    id: '31414',
    title: 'Toscana Culture',
    description: 'Senior Barman entertainment engaged in a full-time consulting role as the General Manager, Entertainment & Digital Strategist of Toscana Culture to innovatively and strategically manage and grow the brand\'s social media presence across Facebook, TikTok, Instagram, and YouTube by sharing vibrant digital displays of the traditional Ogene dance, thereby successfully expanding audience reach while sharing the culture\'s love globally.\n',
    logo: '/toscana-logo.png',
    color: "#000000"
  },
  {
    id: '99184',
    title: 'Party Park',
    description: 'Party in the Park, an exciting initiative by Ogidi Concept in partnership with Senior Barman, redefines outdoor partying by taking the intimacy of a house party and transforming it into a high-production, concert-like spectacle.\n' +
        '\n' +
        'We specialize in overnight venue transformation, using excellent lighting, custom stages, and professional sound to create an immersively electrifying atmosphere for the Party. \n' +
        '\n' +
        'Our events are packed with non-stop entertainment, featuring a diverse roster of scheduled acts including dancers, and special performers.\n' +
        '\n' +
        'This is our great escape, a night of pure fun. \n' +
        'Party in the Park frees the wild heart in every guest and keeps the dancers moving until the sun rises. We give you one magical night a year; a beautiful chance to let loose and be free. We meet again February 12 2026! \n',
    logo: '/party-park-logo.png',
    color: "#FDB902"
  },
  {
    id: '09031',
    title: 'Bamboo Garden',
    description: 'Bamboo Garden is the premier relaxation and entertainment destination in Awka, Anambra State. \n' +
        'Bamboo Garden is the premier relaxation and entertainment destination in Awka, Anambra State. \n' +
        'Strategically located at Aroma Junction, it offers a uniquely Nigerian ambiance, characterized by its signature tall palm trees that provide natural shielding and a perpetually cool, serene effect against the sunlight.\n' +
        '\n' +
        'More than just a bar, Bamboo Garden offers a diverse setting where patrons can unwind in this tranquil environment while enjoying gaming and social activities. \n' +
        'It features a full bar and a kitchen, serving delicious meals and making it the perfect spot to gather with friends for a relaxed evening or simply to escape the city\'s hustle. \n' +
        'Bamboo Garden defines the best of Awka\'s social scene; a uniquely sheltered, tranquil, yet engaging environment for all.\n' +
        '\n',
    logo: '/boo-garden-logo.png',
    color: "#08A877"
  },
  {
    id: '12131',
    title: 'acetec',
    description: 'We provide premium, modern slot gaming experiences in partnership with industry leaders like SAX Innovatives, Hot Fun, and Promatic Groups. We operate a rapidly expanding network of entertainment centers designed to offer customers a relaxed environment for fun and the opportunity to win cash prizes. Our slot machines are strategically located across key locations including Toscana (Asaba, Port Harcourt, Enugu), Blue Berries Park (Awka), and Bamboo Garden (Awka), ensuring widespread accessibility to a high-quality gaming experience.\n',
    logo: '/acetec-logo.png',
    color: "#00A31E"
  },
  {
    id: '001331',
    title: 'Connect II Humanity',
    description: 'Connect 2 Humanity is a synergy-driven community dedicated to mutual support and collective advancement. We facilitate a robust peer-to-peer system where individuals are aligned to assist one another from providing essential support during challenging times to leveraging shared opportunities for professional and personal growth. Our core mission is to create a "butterfly effect" of empowerment, ensuring that every member can stand strong, leaning on the network to achieve their potential. Furthermore, we actively engage in community initiatives, such as PVC registration drives, to ensure our network is socially and politically active',
    logo: '/connect-humanity-logo.png',
    color: "#0095D9"
  },
    {
    id: '012431',
    title: 'Rangers Football Club',
    description: 'Leads the Event Management and Hospitality for all Rangers FC sports events, serving as the influential "Rangers 12th man", to boost player morale, and significantly improve the fan ticketing experience. This system is currently evolving to incorporate QR code tickets for seamless entry, enabling bouncers to work more efficiently. It is an operational solution with clear scaling potential.\n',
    logo: '/clubs/rangers-club-logo.jpg',
    color: "#000000"
  }
]

export default function Home() {
  return (
    <div className="relative bg-gray-100 overflow-x-hidden">
      {/* Absolute Login Button */}
      {/* <section className="absolute right-0 top-0 ">
        <Link href={"/auth/login"}>
          <button className="p-4 flex gap-2 hover:opacity-90 duration-200 bg-orange-400 text-white cursor-pointer">
            Log In <User />
          </button>
        </Link>
      </section> */}
      <section className="flex w-full md:w-1/2 justify-center mx-auto pt-8 flex-col gap-2 items-center">
        <Image src='/logo.png' alt="logo" width={400} height={100} />
        <Header />
      </section>
      <About />
      <section className="flex mx-4 lg:ml-24 flex-col gap-4 mt-42 pb-12">
        <div>
          <h4 className="text-[#E67A00] text-4xl">Businesses</h4>
          <p className="text-[#9F9F9F]">Ecosystems <strong>Chijioke</strong> has built with perfectly aligned services</p>
        </div>

        {/* <section className="lg:grid flex flex-col lg:grid-cols-3 gap-x-5 gap-y-18 "> */}
        <section className="flex flex-wrap gap-8 pr-4 xl:grid lg:grid-cols-3 justify-between">
          {BUSINESSES.map(business => <BusinessCard business={business} key={business.id} />)}

        </section>
      </section>
    </div>
  );
}
