import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Building2,
  DollarSign,
  Calendar,
  Users,
  Briefcase,
  Star,
  Home,
  Globe,
  Award,
  ArrowRight,
  CheckCircle,
  Target
} from 'lucide-react';
import { Opportunity } from './OpportunitiesList/types';
import { 
  formatDate, 
  calculateDaysLeft, 
  getTypeColor, 
  getOpportunityTypeLabel,
  getExperienceLevelLabel
} from './OpportunitiesList/utils';

interface FeaturedOpportunitiesCarouselProps {
  opportunities: Opportunity[];
}

const FeaturedOpportunitiesCarousel = ({ opportunities }: FeaturedOpportunitiesCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Filter out expired opportunities
  const activeOpportunities = opportunities.filter(opp => {
    if (!opp.deadline) return true; // If no deadline, consider it active
    const daysLeft = calculateDaysLeft(opp.deadline);
    return daysLeft === null || daysLeft > 0;
  });

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (activeOpportunities.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === activeOpportunities.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [activeOpportunities.length]);

  if (activeOpportunities.length === 0) {
    return null;
  }

  const currentOpportunity = activeOpportunities[currentIndex];
  const daysLeft = currentOpportunity.deadline ? calculateDaysLeft(currentOpportunity.deadline) : null;
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const postedDate = formatDate(currentOpportunity.postedDate);

  const handlePrevious = () => {
    setCurrentIndex(currentIndex === 0 ? activeOpportunities.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex === activeOpportunities.length - 1 ? 0 : currentIndex + 1);
  };

  const defaultCoverImage = 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
  const coverImage = currentOpportunity.coverImage || defaultCoverImage;

  return (
    <div className="relative mb-8">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5" fill="currentColor" />
            <span className="font-bold text-lg">Featured Opportunity</span>
          </div>
          {activeOpportunities.length > 1 && (
            <div className="flex items-center gap-1">
              {activeOpportunities.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to opportunity ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="relative">
          {/* Cover Image with Overlay */}
          <div className="relative h-80 overflow-hidden">
            <img
              src={coverImage}
              alt={`${currentOpportunity.title} cover`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            
            {/* Urgent Badge */}
            {isUrgent && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg animate-pulse">
                <Clock className="h-4 w-4" />
                Closing Soon - {daysLeft} days left
              </div>
            )}

            {/* Navigation Buttons */}
            {activeOpportunities.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition-all"
                  aria-label="Previous opportunity"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-2 transition-all"
                  aria-label="Next opportunity"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Company Logo */}
            <div className="absolute bottom-4 left-6">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-2 shadow-xl border-4 border-white dark:border-slate-800">
                {currentOpportunity.company.logo ? (
                  <img
                    src={currentOpportunity.company.logo}
                    alt={`${currentOpportunity.company.name} logo`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {currentOpportunity.title}
                  </h2>
                  <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">
                    {currentOpportunity.company.name}
                  </p>
                </div>

                {/* Key Details */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                    <span>{currentOpportunity.location}</span>
                  </div>
                  {currentOpportunity.salary && (
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                      <span className="font-medium">{currentOpportunity.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                    <span>{getOpportunityTypeLabel(currentOpportunity.type)}</span>
                  </div>
                  {currentOpportunity.remote && (
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <Home className="h-5 w-5 mr-2 text-purple-500" />
                      <span>Remote Available</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                    {currentOpportunity.description}
                  </p>
                </div>

                {/* Responsibilities & Requirements */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {currentOpportunity.responsibilities && currentOpportunity.responsibilities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-orange-500" />
                        Key Responsibilities
                      </h3>
                      <ul className="space-y-2">
                        {currentOpportunity.responsibilities.slice(0, 3).map((resp, index) => (
                          <li key={index} className="flex items-start text-slate-600 dark:text-slate-400">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {currentOpportunity.requirements && currentOpportunity.requirements.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-blue-500" />
                        Requirements
                      </h3>
                      <ul className="space-y-2">
                        {currentOpportunity.requirements.slice(0, 3).map((req, index) => (
                          <li key={index} className="flex items-start text-slate-600 dark:text-slate-400">
                            <CheckCircle className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 sticky top-4">
                  {/* Tags */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getTypeColor(currentOpportunity.type)}`}>
                        {getOpportunityTypeLabel(currentOpportunity.type)}
                      </span>
                      {currentOpportunity.experienceLevel && (
                        <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-800">
                          {getExperienceLevelLabel(currentOpportunity.experienceLevel)}
                        </span>
                      )}
                      {currentOpportunity.remote && (
                        <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium border border-emerald-200 dark:border-emerald-800">
                          <Globe className="h-4 w-4 mr-1" />
                          Remote OK
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Posted</span>
                      <span className="font-medium text-slate-900 dark:text-white">{postedDate}</span>
                    </div>
                    {currentOpportunity.deadline && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Deadline</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatDate(currentOpportunity.deadline)}
                        </span>
                      </div>
                    )}
                    {daysLeft !== null && daysLeft > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Time Left</span>
                        <span className={`font-medium ${isUrgent ? 'text-red-500' : 'text-green-500'}`}>
                          {daysLeft} days
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <Link
                    to={`/opportunities/${currentOpportunity.originalId || String(currentOpportunity.id)}`}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                  >
                    View Full Details
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedOpportunitiesCarousel;