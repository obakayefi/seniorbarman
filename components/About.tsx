import React from 'react'

const About = () => {
  return (
    <div className='outline-1 text-white mt-4 text-center  flex flex-col items-center h-auto pb-18 p-4 bg-[url("/about-bg.png")] bg-cover bg-center'>
      <h3 className='text-xl bg-[#1A1A1A]/40 inline-flex p-2 px-6 rounded-full text-[#CCCCCC]'>ABOUT</h3>

      <div className='flex flex-col mt-10 text-xl w-2/3 text-left font-normal gap-4'>
        <p className=''>
          <span className='text-5xl'>P</span>opularly known as Senior Barman, is a Nigerian entrepreneur and entertainment executive. The founder and Chief Executive Officer of Senior Barman Entertainment Ltd, an event management and hospitality firm based in Enugu, Nigeria. The company manages the entertainment operations of Villa Toscana Hotels and oversees hospitality and ticketing for Rangers International Football Club of Enugu.
        </p>

        <p>
          <span className='text-5xl'>E</span>zeoke is also the convener of Party in the Park, an annual outdoor event organized by Toscana’s “Party at The Park” initiative. In addition to his entertainment ventures, he established the Connect to Humanity Foundation, which organized a free voter registration drive at Okpara Square, Enugu, in 2023.
        </p>

        <p>
          <span className='text-5xl'>H</span>e is a founding member of the Toscana Sports Club and an active advocate for community-based engagement in Anambra and Enugu States. Ezeoke is married to Nemi Chukwurah-Ezeoke, and they have four children.
        </p>
      </div>
    </div>
  )
}

export default About