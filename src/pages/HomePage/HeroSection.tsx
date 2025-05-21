import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Connecting Kootenay Tech Professionals
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Join our growing tech community to connect, collaborate, and grow together.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/directory"
              className="px-6 py-3 bg-white text-orange-500 hover:bg-white/90 transition-colors rounded-lg font-medium"
            >
              View Directory
            </Link>
            <Link
              to="/events"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors rounded-lg font-medium"
            >
              Upcoming Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
