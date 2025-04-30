import Hero from "@/components/hero";
import { CheckCircle, Medal, PieChart, Users } from "lucide-react";
import { ReactNode } from "react";

export default function Home() {
  return (
    <>
      <Hero />
      
      <section id="features" className="py-20 container">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why PortofolioSiswa?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A modern platform for students and teachers to track academic progress with ease.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<PieChart className="h-8 w-8 text-blue-500" />}
            title="Visual Analytics"
            description="Track academic progress with beautiful visual charts and graphics."
          />
          <FeatureCard 
            icon={<CheckCircle className="h-8 w-8 text-green-500" />}
            title="Easy Data Entry"
            description="Simple forms to input academic records and achievements."
          />
          <FeatureCard 
            icon={<Medal className="h-8 w-8 text-amber-500" />}
            title="Achievement Tracking"
            description="Record and showcase academic and extracurricular accomplishments."
          />
          <FeatureCard 
            icon={<Users className="h-8 w-8 text-purple-500" />}
            title="Multi-User Access"
            description="Different access levels for students, teachers, and administrators."
          />
          <FeatureCard 
            icon={<Users className="h-8 w-8 text-indigo-500" />}
            title="Google Sign-In"
            description="Quick and secure login with your Google account."
          />
          <FeatureCard 
            icon={<PieChart className="h-8 w-8 text-rose-500" />}
            title="Comprehensive Reports"
            description="Generate detailed academic performance reports."
          />
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Academic Record Management</h2>
              <p className="text-muted-foreground mb-6">
                PortofolioSiswa provides a comprehensive dashboard to visualize academic records, making it easy to track progress over time.
              </p>
              <ul className="space-y-3">
                {["Record management", "Visual analytics", "Progress tracking", "Achievement showcase"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 aspect-video flex items-center justify-center p-8">
              <div className="text-xl font-medium text-center text-muted-foreground">
                Dashboard Visualization
                <p className="text-sm mt-2">Circle diagram showing average marks and academic progress</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Get Started Today</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of students who are already using PortofolioSiswa to track their academic journey.
          </p>
          <a 
            href="/sign-in" 
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md font-medium transition-colors"
          >
            Create Your Portfolio
          </a>
        </div>
      </section>
    </>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
