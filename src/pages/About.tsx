
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Gem, Handshake, Hammer } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';

const ValueCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}> = ({ icon, title, description, delay }) => (
  <div className={`bg-white p-8 rounded-lg shadow-sm animate-fade-in ${delay}`}>
    <div className="flex items-center mb-4">
      <div className="bg-gold/10 p-3 rounded-full text-gold mr-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-charcoal">{title}</h3>
    </div>
    <p className="text-charcoal-light">{description}</p>
  </div>
);

// Mock team data
const teamMembers = [
  {
    id: 1,
    name: 'Arjun Mehta',
    role: 'Master Artisan',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Design Director',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80'
  },
  {
    id: 3,
    name: 'Rajiv Kapoor',
    role: 'Stone Specialist',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  },
  {
    id: 4,
    name: 'Ananya Desai',
    role: 'Heritage Consultant',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80'
  }
];

const About: React.FC = () => {
  return (
    <Layout>
      {/* Header */}
      <section className="pt-28 pb-20 px-4 bg-gradient-to-b from-gold/10 to-offwhite">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 animate-fade-in">
            Our Story
          </h1>
          <p className="text-lg text-charcoal-light animate-fade-in delay-150">
            For three generations, Saaral has crafted jewelry that celebrates life's precious moments.
          </p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in">
              <img 
                src="https://images.unsplash.com/photo-1594970369113-3aeaa4a62891?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Artisan crafting jewelry" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div className="animate-fade-in delay-300">
              <h2 className="text-3xl font-serif mb-6">Heritage of Craftsmanship</h2>
              <p className="text-charcoal-light mb-4">
                Founded in 1975 by master goldsmith Raman Saaral, our atelier began as a small workshop dedicated to preserving traditional jewelry-making techniques while embracing modern design sensibilities.
              </p>
              <p className="text-charcoal-light mb-4">
                Today, led by the third generation of the Saaral family, we continue to honor our heritage while pushing the boundaries of innovation. Every piece that leaves our workshop carries with it decades of expertise and a commitment to excellence.
              </p>
              <p className="text-charcoal-light">
                Our artisans, many of whom have been with us for over 20 years, bring unparalleled skill and passion to their craft. We believe that truly exceptional jewelry is born from the hands of those who approach their work not just as a profession, but as an art form.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-offwhite-dark">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-4 animate-fade-in">Our Values</h2>
            <p className="text-charcoal-light max-w-2xl mx-auto animate-fade-in delay-150">
              The principles that guide every piece we create
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard 
              icon={<Handshake size={24} />}
              title="Ethically Sourced"
              description="We partner only with suppliers who share our commitment to responsible mining and fair labor practices."
              delay="delay-0"
            />
            
            <ValueCard 
              icon={<Hammer size={24} />}
              title="Handcrafted"
              description="Each piece is meticulously crafted by hand, ensuring unparalleled quality and attention to detail."
              delay="delay-150"
            />
            
            <ValueCard 
              icon={<Gem size={24} />}
              title="Luxury Redefined"
              description="We believe true luxury lies in timeless design, exceptional materials, and meaningful creation stories."
              delay="delay-300"
            />
          </div>
        </div>
      </section>

      {/* Team/Artisans Carousel */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-4 animate-fade-in">Our Artisans</h2>
            <p className="text-charcoal-light max-w-2xl mx-auto animate-fade-in delay-150">
              The skilled hands and creative minds behind every Saaral creation
            </p>
          </div>
          
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {teamMembers.map((member) => (
                <CarouselItem key={member.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-2">
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-zoom-in">
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-4 text-center">
                        <h3 className="font-medium text-lg text-charcoal">{member.name}</h3>
                        <p className="text-charcoal-light">{member.role}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 px-4 bg-charcoal text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-serif mb-6 animate-fade-in">Our Vision</h2>
          <p className="text-xl leading-relaxed animate-fade-in delay-150">
            "To create jewelry that becomes an inseparable part of life's most cherished moments, pieces that are passed down through generations as tangible memories of love and celebration."
          </p>
          <p className="mt-4 italic text-gold animate-fade-in delay-300">— The Saaral Family</p>
        </div>
      </section>
    </Layout>
  );
};

export default About;
