
import { Card, CardContent } from "@/components/ui/card"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <NavigationMenu className="mx-auto">
            <NavigationMenuList className="gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-gold",
                    "border-b-2 border-gold pb-1" // Added underline for active item
                  )}
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-gold"
                  )}
                >
                  Collections
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-gold"
                  )}
                >
                  About
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 relative">
        <div className="absolute inset-0 bg-[url('/lovable-uploads/e1e906ce-bd9e-4436-be72-7f1b0be49e13.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-black/20"></div> {/* Overlay to ensure text is readable */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white animate-fade-in">
              Timeless Elegance
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 animate-fade-in delay-150">
              Crafted for You
            </p>
            <button className="bg-amber-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-amber-700 transition-all transform hover:scale-105 animate-fade-in delay-300">
              Explore Collections
            </button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fade-in">
            Featured Pieces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="overflow-hidden group animate-fade-in hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Elegant {item === 1 ? 'Necklace' : item === 2 ? 'Ring' : 'Bracelet'}</h3>
                  <p className="text-gray-600">Handcrafted with precision and care</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 animate-fade-in">
            Connect With Us
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in delay-150">
            Let us help you find the perfect piece for your special moment.
          </p>
          <button className="bg-primary/10 text-primary px-8 py-3 rounded-full text-lg font-medium hover:bg-primary/20 transition-all transform hover:scale-105 animate-fade-in delay-300">
            Contact Us
          </button>
        </div>
      </section>
    </div>
  )
}

export default Index
