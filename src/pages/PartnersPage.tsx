import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Handshake, Star, Mail, ExternalLink, Heart, Users, Zap } from 'lucide-react';

export default function PartnersPage() {
  const partners = [
    {
      id: 1,
      name: "TechStart Nelson",
      description: "Supporting tech startups and entrepreneurs in the Nelson region with funding, mentorship, and resources.",
      logo: "/images/partners/techstart-nelson.png",
      website: "https://techstartnelson.ca",
      type: "Innovation Hub",
      tier: "Platinum",
      founded: 2019,
      contribution: "Startup incubation, mentorship programs, and seed funding for local tech ventures."
    },
    {
      id: 2,
      name: "Selkirk College",
      description: "Leading educational institution providing technology programs and workforce development in the Kootenays.",
      logo: "/images/partners/selkirk-college.png",
      website: "https://selkirk.ca",
      type: "Educational Institution",
      tier: "Platinum",
      founded: 1966,
      contribution: "Technology education, research partnerships, and skilled graduate pipeline."
    },
    {
      id: 3,
      name: "Kootenay Business Centre",
      description: "Business development organization supporting local entrepreneurs and companies across all sectors.",
      logo: "/images/partners/kootenay-business.png",
      website: "https://kootenaybc.com",
      type: "Business Development",
      tier: "Gold",
      founded: 1995,
      contribution: "Business consulting, networking events, and growth strategy support."
    },
    {
      id: 4,
      name: "Community Futures Central Kootenay",
      description: "Providing business loans, training, and support to help create and expand businesses.",
      logo: "/images/partners/community-futures.png",
      website: "https://cfck.ca",
      type: "Financial Services",
      tier: "Gold",
      founded: 1987,
      contribution: "Small business loans, entrepreneurship training, and economic development."
    },
    {
      id: 5,
      name: "Nelson & District Chamber of Commerce",
      description: "Representing and supporting the business community in Nelson and surrounding areas.",
      logo: "/images/partners/nelson-chamber.png",
      website: "https://nelsonkootenaybay.com",
      type: "Business Association",
      tier: "Silver",
      founded: 1897,
      contribution: "Business advocacy, networking opportunities, and community promotion."
    },
    {
      id: 6,
      name: "City of Nelson",
      description: "Municipal government committed to supporting innovation and economic development.",
      logo: "/images/partners/city-nelson.png",
      website: "https://nelson.ca",
      type: "Government",
      tier: "Silver",
      founded: 1897,
      contribution: "Economic development initiatives, infrastructure support, and policy advocacy."
    }
  ];

  const supportLevels = [
    {
      tier: "Platinum",
      color: "from-slate-400 to-slate-600",
      icon: <Star className="h-6 w-6" />,
      benefits: ["Logo placement on all materials", "Speaking opportunities at events", "Dedicated partnership manager", "Custom collaboration opportunities"]
    },
    {
      tier: "Gold",
      color: "from-yellow-400 to-yellow-600",
      icon: <Building2 className="h-6 w-6" />,
      benefits: ["Logo on website and select materials", "Event participation opportunities", "Quarterly partnership meetings", "Access to member network"]
    },
    {
      tier: "Silver",
      color: "from-gray-300 to-gray-500",
      icon: <Handshake className="h-6 w-6" />,
      benefits: ["Website logo listing", "Newsletter mentions", "Community event invitations", "Networking opportunities"]
    }
  ];

  const partnershipTypes = [
    {
      icon: <Building2 className="h-8 w-8" />,
      title: "Corporate Partners",
      description: "Established companies supporting our mission through funding, expertise, and resources."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Organizations",
      description: "Local non-profits and associations working together to strengthen our tech ecosystem."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Innovation Hubs",
      description: "Incubators, accelerators, and research institutions driving tech innovation in our region."
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Government Partners",
      description: "Municipal, provincial, and federal agencies supporting economic development and innovation."
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'border-slate-400 bg-slate-50 dark:bg-slate-800/50';
      case 'Gold': return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'Silver': return 'border-gray-400 bg-gray-50 dark:bg-gray-800/50';
      default: return 'border-gray-300 bg-white dark:bg-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Our Partners
            </h1>
            <p className="text-xl text-orange-100 mb-8">
              Building a thriving tech ecosystem through collaboration and community partnership
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
              >
                <Handshake className="h-5 w-5 mr-2" />
                Become a Partner
              </Link>
              <Link
                to="#partners"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-colors"
              >
                <Users className="h-5 w-5 mr-2" />
                View Partners
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        
        {/* Partnership Mission */}
        <section className="mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              Strengthening Our Tech Community Together
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Our partners are the backbone of the Uluntu Community. Through strategic partnerships, 
              we create opportunities for innovation, education, and economic growth that benefit everyone 
              in our region.
            </p>
          </div>
        </section>

        {/* Partnership Types */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white text-center">
            Types of Partnerships
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnershipTypes.map((type, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="text-orange-500 mb-4">
                  {type.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                  {type.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Partner Levels */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white text-center">
            Partnership Levels
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {supportLevels.map((level, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-white bg-gradient-to-r ${level.color} mb-4`}>
                  {level.icon}
                  <span className="ml-2 font-semibold">{level.tier}</span>
                </div>
                <ul className="space-y-2">
                  {level.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                      <Star className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Current Partners */}
        <section id="partners" className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white text-center">
            Our Current Partners
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className={`rounded-lg p-6 shadow-sm border-2 hover:shadow-md transition-shadow ${getTierColor(partner.tier)}`}
              >
                {/* Partner Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1 text-slate-900 dark:text-white">
                      {partner.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                        {partner.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded text-white bg-gradient-to-r ${
                        partner.tier === 'Platinum' ? 'from-slate-400 to-slate-600' :
                        partner.tier === 'Gold' ? 'from-yellow-400 to-yellow-600' :
                        'from-gray-300 to-gray-500'
                      }`}>
                        {partner.tier}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Partner Description */}
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  {partner.description}
                </p>

                {/* Partner Details */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <strong>Founded:</strong> {partner.founded}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Contribution:</strong> {partner.contribution}
                  </div>
                </div>

                {/* Partner Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-600">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit Website
                  </a>
                  <span className="text-xs text-slate-400">
                    Partner since {partner.founded}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
            Interested in Partnering With Us?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
            Join our growing network of partners and help shape the future of technology in the Kootenays. 
            Together, we can build something amazing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              Get in Touch
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center px-6 py-3 border-2 border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-600 hover:text-white transition-colors"
            >
              Learn More About Us
            </Link>
          </div>
        </section>

        {/* Partnership Benefits */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white text-center">
            Why Partner With Us?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                Active Community
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Connect with over 500+ tech professionals, entrepreneurs, and innovators in the region.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                Innovation Focus
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Be part of initiatives that drive technological advancement and economic growth.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                Community Impact
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Make a meaningful difference in building a sustainable tech ecosystem in the Kootenays.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}