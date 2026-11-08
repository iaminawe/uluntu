import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building, Calendar, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              About Uluntu Community
            </h1>
            <p className="text-xl text-orange-100">
              Connecting tech professionals, entrepreneurs, and innovators in the Nelson region
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Mission Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
            Our Mission
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
            The Uluntu Community is dedicated to fostering innovation, collaboration, 
            and growth in the technology sector throughout the Nelson region. We bring 
            together developers, entrepreneurs, designers, and tech enthusiasts to share 
            knowledge, build connections, and drive the future of technology in our community.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Whether you're a seasoned professional, a startup founder, or just beginning 
            your tech journey, our community provides the resources, networking opportunities, 
            and support you need to succeed.
          </p>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-slate-900 dark:text-white text-center">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-orange-500 mr-3" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Professional Network
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Connect with fellow tech professionals, share experiences, and build 
                lasting professional relationships in our vibrant directory.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Calendar className="h-8 w-8 text-orange-500 mr-3" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Events & Meetups
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Attend workshops, conferences, networking events, and tech talks 
                designed to expand your knowledge and professional network.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Building className="h-8 w-8 text-orange-500 mr-3" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Company Showcase
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Discover local tech companies, learn about career opportunities, 
                and explore the innovative businesses shaping our region.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <MapPin className="h-8 w-8 text-orange-500 mr-3" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Local Focus
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Specifically designed for the Nelson region, creating meaningful 
                connections within our local tech ecosystem.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16 bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-800 dark:to-slate-700 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white text-center">
            Community Impact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-slate-600 dark:text-slate-300">Active Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-slate-600 dark:text-slate-300">Local Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">100+</div>
              <div className="text-slate-600 dark:text-slate-300">Events Hosted</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Connect with like-minded professionals and take your tech career to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              Join the Community
            </Link>
            <Link
              to="/contact"
              className="border border-orange-600 text-orange-600 dark:text-orange-400 px-8 py-3 rounded-lg hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors font-semibold"
            >
              Get in Touch
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}