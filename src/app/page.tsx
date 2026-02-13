'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scissors, Calendar, MapPin, Instagram, Facebook, Clock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-primary rotate-90" />
            <span className="text-xl font-bold tracking-tighter">StyleSync</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#inicio" className="hover:text-primary transition-colors">Inicio</Link>
            <Link href="#nosotros" className="hover:text-primary transition-colors">Nosotros</Link>
            <Link href="#servicios" className="hover:text-primary transition-colors">Servicios</Link>
            <Link href="#galeria" className="hover:text-primary transition-colors">Galería</Link>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Link href="/book">Reservar Turno</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop"
            alt="Barbershop Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-background via-black/50 to-black/30" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center space-y-8 animate-in fade-in zoom-in duration-1000">
          <div className="inline-block px-3 py-1 border border-primary/30 rounded-full bg-black/50 backdrop-blur-sm text-primary text-sm font-medium mb-4">
            EST. 2024 &bull; BUENOS AIRES
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
            Más que un Corte,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-200">
              Un Legado de Estilo
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Experimenta la fusión perfecta entre la barbería clásica y las tendencias modernas.
            Cuidado personal exclusivo para caballeros exigentes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/book">Reservar Cita</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="#servicios">Ver Servicios</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-24 bg-zinc-950/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/20 rounded-xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <img
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000&auto=format&fit=crop"
                alt="Barber Working"
                className="relative rounded-xl shadow-2xl border border-white/10 w-full object-cover aspect-[4/5]"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Nuestra Historia</h2>
              <div className="w-20 h-1 bg-primary rounded-full" />
              <p className="text-muted-foreground text-lg leading-relaxed">
                Fundada con la visión de recuperar el arte perdido de la barbería tradicional,
                StyleSync nació como un espacio donde el tiempo se detiene. No solo cortamos cabello;
                esculpimos confianza.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Nuestro equipo de maestros barberos combina técnicas de la vieja escuela con herramientas
                de precisión moderna para ofrecerte un resultado impecable en cada visita.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">500+</h3>
                  <p className="text-sm text-muted-foreground">Clientes Felices</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">5+</h3>
                  <p className="text-sm text-muted-foreground">Años de Experiencia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section id="servicios" className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">Nuestros Servicios</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Corte Clásico", price: "$4.000", desc: "Tijera y máquina, acabado natural.", img: "https://images.unsplash.com/photo-1599351431202-6e0000a7896d?q=80&w=800" },
              { title: "Barba & Toalla", price: "$2.500", desc: "Perfilado con navaja y toalla caliente.", img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800" },
              { title: "Servicio Completo", price: "$6.000", desc: "Corte premium + Barba + Bebida.", img: "https://images.unsplash.com/photo-1503951914875-befbb713d752?q=80&w=800" }
            ].map((s, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl aspect-[3/4] flex items-end p-6 border border-white/10">
                <img src={s.img} alt={s.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="relative z-10 text-left w-full">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-xl font-bold text-white">{s.title}</h3>
                    <span className="text-primary font-bold">{s.price}</span>
                  </div>
                  <p className="text-sm text-zinc-300 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                    {s.desc}
                  </p>
                  <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm" asChild>
                    <Link href="/book">Reservar</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery / Work Showcase */}
      <section id="galeria" className="py-24 bg-zinc-950/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Galería de Estilos</h2>
            <Button variant="link" className="text-primary">Ver todo en Instagram</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px]">
            <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1503951914875-befbb713d752?auto=format&fit=crop&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 1" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1599351431202-6e0000a7896d?auto=format&fit=crop&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 2" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 3" />
            </div>
            <div className="col-span-2 relative rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 4" />
            </div>
          </div>
        </div>
      </section>

      {/* Location & Footer */}
      <footer className="bg-black py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="w-6 h-6 text-primary rotate-90" />
                <span className="text-2xl font-bold tracking-tighter text-white">StyleSync</span>
              </div>
              <p className="text-muted-foreground">
                Elevando el estándar de la barbería moderna. <br />
                Tu estilo, nuestra pasión.
              </p>
              <div className="flex gap-4">
                <Button size="icon" variant="ghost" className="hover:text-primary"><Instagram className="w-5 h-5" /></Button>
                <Button size="icon" variant="ghost" className="hover:text-primary"><Facebook className="w-5 h-5" /></Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Horarios</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Lun - Vie: 09:00 - 20:00</li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Sábados: 10:00 - 18:00</li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Domingos: Cerrado</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Ubicación</h3>
              <p className="text-muted-foreground flex items-start gap-2">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                Av. Corrientes 1234<br />
                Buenos Aires, Argentina
              </p>
              <Button variant="outline" className="w-full mt-2">Ver en Mapa</Button>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-muted-foreground">
            &copy; 2024 StyleSync Barbería. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
