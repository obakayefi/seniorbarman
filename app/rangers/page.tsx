import Hero from "@/components/ui/hero";
import HowItWorks from "@/components/ui/how-it-works";
import UpcomingMatches from "@/components/ui/upcoming-matches";

export default function RangersPage() {
    return (
        <section className={''}>
            {/*<FloatingNav navItems={navItems}/>*/}

            <div className="relative h-[90vh] lg:h-[85vh] overflow-x-hidden text-white">
                {/* background image */}
                <div className="absolute inset-0 bg-[url('/header-bg.png')] bg-cover h-[90vh] lg:h-[85vh] bg-center bg-no-repeat z-0"/>

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-red-600/30 z-10"/>

                {/* content */}
                <div className="relative z-20 flex py-20 mx-4 lg:mx-60 h-full">
                    <Hero/>
                </div>
            </div>
            <HowItWorks/>
            <UpcomingMatches/>
            {/*<UpcomingEvents/>*/}
        </section>
    )
}