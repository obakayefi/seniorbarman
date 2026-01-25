import React, { useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from "embla-carousel-autoplay"
import Image from 'next/image'

export function EmblaCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()])

    useEffect(() => {
        if (emblaApi) {
          //   console.log(emblaApi.slideNodes()) // Access API
        }
    }, [emblaApi])

    return (
        <div className="embla" ref={emblaRef}>
            <div className="embla__container">
                <div className="embla__slide">
                    <Image alt='fixture one' src={'/slides/fixture_slide_one.jpg'} width={400} height={400}/>
                </div>
                <div className="embla__slide">
                     <Image alt='fixture one' src={'/fixture_slide_two.jpg'} width={400} height={400}/>
                </div>
                <div className="embla__slide">
                     <Image alt='fixture one' src={'/fixture_slide_two.jpg'} width={600} height={400}/>
                </div>
            </div>
        </div>
    )
}
