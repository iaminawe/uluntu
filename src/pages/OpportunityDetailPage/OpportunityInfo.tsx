import { OpportunityInfoProps } from './types';

const OpportunityInfo: React.FC<OpportunityInfoProps> = ({ opportunity }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
      {/* Left column with posted by, requirements, responsibilities */}
      <div className="space-y-8">
        {/* Posted By */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Posted By
          </h2>
          <div className="flex items-center">
            <img 
              src={opportunity.postedBy.image} 
              alt={opportunity.postedBy.name}
              className="h-12 w-12 rounded-full mr-4 object-cover" 
            />
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">
                {opportunity.postedBy.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {opportunity.postedBy.title}
              </p>
            </div>
          </div>
          <p className="mt-3 text-slate-700 dark:text-slate-300">
            {opportunity.postedBy.bio}
          </p>
        </div>
        
        {/* Requirements */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Requirements
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
            {opportunity.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
        
        {/* Responsibilities */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Responsibilities
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
            {opportunity.responsibilities.map((resp, index) => (
              <li key={index}>{resp}</li>
            ))}
          </ul>
        </div>
        
        {/* Benefits */}
        {opportunity.benefits && opportunity.benefits.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Benefits
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
              {opportunity.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityInfo;
