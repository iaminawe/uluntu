import { Link } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { PageHeaderProps } from './types';

const PageHeader: React.FC<PageHeaderProps> = ({ id }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <Link
        to="/companies"
        className="inline-flex items-center text-orange-500 hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Companies
      </Link>
      
      <Link
        to={`/companies/${id}/edit`}
        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow hover:shadow-md"
      >
        <Edit className="h-5 w-5 mr-2" />
        Edit Company
      </Link>
    </div>
  );
};

export default PageHeader;
