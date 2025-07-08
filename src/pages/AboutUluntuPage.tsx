import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Globe, 
  Shield, 
  Zap, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Heart,
  Code,
  Palette,
  Lock,
  Cloud,
  ChevronRight,
  Check,
  Star,
  Quote
} from 'lucide-react';

export default function AboutUluntuPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-24 sm:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 animate-fade-in">
              Welcome to Uluntu
            </h1>
            <p className="text-2xl sm:text-3xl text-orange-100 mb-8 font-light">
              The Community Platform That Brings People Together
            </p>
            <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Build, grow, and nurture your community with a platform designed for meaningful connections and collaborative growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-orange-600 px-8 py-4 rounded-lg hover:bg-orange-50 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
              >
                Start Your Community
              </Link>
              <a
                href="#features"
                className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-all font-semibold text-lg"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
      </section>

      {/* Etymology Section */}
      <section className="py-16 sm:py-24 bg-orange-50 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">
              The Meaning Behind Uluntu
            </h2>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg">
              <p className="text-xl text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                <span className="font-semibold text-orange-600">Uluntu</span> comes from the Zulu language, 
                where it represents the essence of <span className="font-semibold">Ubuntu</span> - 
                the philosophy that "I am because we are."
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Just as Ubuntu emphasizes our interconnectedness and shared humanity, 
                Uluntu provides the digital space where communities thrive through 
                collaboration, support, and shared purpose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white">
            Everything You Need to Build Thriving Communities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Member Directory"
              description="Connect members with comprehensive profiles, skills, and interests. Foster meaningful connections within your community."
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="Discussion Forums"
              description="Engage in rich conversations with threaded discussions, real-time updates, and intelligent moderation tools."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Event Management"
              description="Organize meetups, workshops, and conferences with built-in RSVP, ticketing, and calendar integration."
            />
            <FeatureCard
              icon={<Globe className="h-8 w-8" />}
              title="Groups & Spaces"
              description="Create focused sub-communities for special interests, projects, or local chapters within your main community."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Analytics & Insights"
              description="Understand your community's health with detailed analytics on engagement, growth, and member activity."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Privacy & Security"
              description="Control access with granular permissions, secure authentication, and GDPR-compliant data handling."
            />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-800/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white">
            Communities That Thrive on Uluntu
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <UseCaseCard
              title="Professional Networks"
              description="Tech communities, industry associations, and professional groups use Uluntu to connect members, share knowledge, and advance careers."
              features={["Job boards", "Skill matching", "Mentorship programs", "Industry events"]}
              gradient="from-blue-500 to-indigo-600"
            />
            <UseCaseCard
              title="Local Communities"
              description="Neighborhood groups, city initiatives, and regional organizations build stronger local connections and coordinate community action."
              features={["Local business directory", "Community events", "Volunteer coordination", "Resource sharing"]}
              gradient="from-green-500 to-teal-600"
            />
            <UseCaseCard
              title="Interest Groups"
              description="From hobbyists to activists, special interest groups create vibrant spaces for passionate people to connect and collaborate."
              features={["Project collaboration", "Resource libraries", "Virtual meetups", "Achievement tracking"]}
              gradient="from-purple-500 to-pink-600"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white">
            Communities Love Uluntu
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              quote="Uluntu transformed how our tech community connects. The event management and member directory features have been game-changers for us."
              author="Sarah Chen"
              role="Founder, DevConnect Portland"
              rating={5}
            />
            <TestimonialCard
              quote="We've seen 3x growth in member engagement since moving to Uluntu. The platform just makes it so easy for people to get involved."
              author="Marcus Johnson"
              role="Community Manager, Green Cities Initiative"
              rating={5}
            />
            <TestimonialCard
              quote="Finally, a community platform that understands privacy and gives us control. Our members feel safe sharing and connecting here."
              author="Elena Rodriguez"
              role="Director, Women in STEM Network"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-800 dark:to-slate-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">
              Flexible Plans for Every Community
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-12">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PricingCard
                title="Starter"
                price="Free"
                description="Perfect for new communities"
                features={["Up to 100 members", "Basic features", "Community support"]}
              />
              <PricingCard
                title="Growth"
                price="$29"
                period="/month"
                description="For growing communities"
                features={["Up to 1,000 members", "All features", "Priority support", "Custom branding"]}
                featured={true}
              />
              <PricingCard
                title="Scale"
                price="Custom"
                description="For large organizations"
                features={["Unlimited members", "Enterprise features", "Dedicated support", "SLA guarantee"]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-8">
              Ready to Build Your Community?
            </h2>
            <p className="text-xl mb-12 text-orange-100">
              Join thousands of communities already thriving on Uluntu.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/signup"
                className="bg-white text-orange-600 px-8 py-4 rounded-lg hover:bg-orange-50 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg inline-flex items-center justify-center"
              >
                Start Free Today
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-all font-semibold text-lg inline-flex items-center justify-center"
              >
                Schedule a Demo
              </Link>
            </div>
            <p className="mt-8 text-sm text-orange-100">
              No credit card required • Free forever for small communities
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center mb-4">
        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

// Use Case Card Component
function UseCaseCard({ 
  title, 
  description, 
  features, 
  gradient 
}: { 
  title: string; 
  description: string; 
  features: string[]; 
  gradient: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className={`h-2 bg-gradient-to-r ${gradient}`}></div>
      <div className="p-8">
        <h3 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {description}
        </p>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-slate-700 dark:text-slate-300">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Testimonial Card Component
function TestimonialCard({ 
  quote, 
  author, 
  role, 
  rating 
}: { 
  quote: string; 
  author: string; 
  role: string; 
  rating: number;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <Quote className="h-8 w-8 text-orange-400 mb-4" />
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-slate-700 dark:text-slate-300 mb-6 italic">
        "{quote}"
      </p>
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">{author}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{role}</p>
      </div>
    </div>
  );
}

// Pricing Card Component
function PricingCard({ 
  title, 
  price, 
  period, 
  description, 
  features, 
  featured = false 
}: { 
  title: string; 
  price: string; 
  period?: string;
  description: string; 
  features: string[];
  featured?: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg ${featured ? 'ring-2 ring-orange-500 scale-105' : ''}`}>
      {featured && (
        <div className="text-center mb-4">
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-4xl font-bold text-slate-900 dark:text-white">{price}</span>
        {period && <span className="text-slate-600 dark:text-slate-400">{period}</span>}
      </div>
      <p className="text-slate-600 dark:text-slate-400 mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-slate-700 dark:text-slate-300">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${
        featured 
          ? 'bg-orange-500 text-white hover:bg-orange-600' 
          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
      }`}>
        Get Started
      </button>
    </div>
  );
}