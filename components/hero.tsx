import { MoveRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="flex flex-col gap-12 items-center w-full max-w-5xl mx-auto py-16 px-5">
      <div className="flex flex-col gap-6 items-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Portofolio Digital Siswa
          </span>
        </h1>
        <p className="text-2xl md:text-3xl !leading-tight max-w-2xl text-center text-muted-foreground">
          Store and manage student academic records with ease.
        </p>
        
        <div className="flex gap-4 mt-4">
          <Link 
            href="/sign-in" 
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md font-medium transition-colors"
          >
            Get Started <MoveRight className="h-4 w-4" />
          </Link>
          {/* <Link 
            href="#learn-more" 
            className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-md font-medium transition-colors"
          >
            Learn More
          </Link> */}
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-6">Can be used by</p>
        <div className="flex flex-wrap justify-center gap-8 opacity-70">
          <div className="text-xl font-semibold">Junior High School</div>
          <div className="text-xl font-semibold">Senior High School</div>
          <div className="text-xl font-semibold">Vocational High School</div>
        </div>
      </div>
    </div>
  );
}
