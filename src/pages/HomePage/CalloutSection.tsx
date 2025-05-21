import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CalloutSectionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  icon: React.ElementType;
  bgColor: string;
}

const CalloutSection: React.FC<CalloutSectionProps> = ({ 
  title, 
  description, 
  buttonText, 
  buttonLink, 
  icon: Icon, 
  bgColor 
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-8 text-white`}>
      <div className="flex items-center mb-4">
        <div className="p-3 bg-white/10 rounded-lg">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-white/80 mb-6">{description}</p>
      <Link
        to={buttonLink}
        className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
      >
        {buttonText}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Link>
    </div>
  );
};

export default CalloutSection;
