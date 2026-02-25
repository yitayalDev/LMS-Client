import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, ShieldCheck, BarChart, Cpu } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100-64px)]">
      <section className="py-20 px-4 text-center bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6">
          Elevate Your Learning Experience
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          A fully functional, scalable Learning Management System built for the future of education.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/register">
            <Button size="lg" className="px-8">Get Started</Button>
          </Link>
          <Link href="/courses">
            <Button size="lg" variant="outline" className="px-8">View Courses</Button>
          </Link>
        </div>
      </section>

      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: GraduationCap, title: "LMS Features", desc: "Course management, curriculum builder, and drip content." },
            { icon: ShieldCheck, title: "Enterprise Security", desc: "JWT, RBAC, and secure data storage." },
            { icon: BarChart, title: "Rich Analytics", desc: "Track progress and course performance with ease." },
            { icon: Cpu, title: "AI Capabilities", desc: "Personalized learning and AI tutor assistance." }
          ].map((feature, i) => (
            <div key={i} className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
