import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

const ActionBar: React.FC = () => {
  return (
    <div className="flex justify-end mb-6 md:mb-8">
      <Link
        to="/directory/create"
        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow hover:shadow-md"
      >
        <PlusCircle className="h-5 w-5 mr-2" />
        Add New Member
      </Link>
    </div>
  );
};

export default ActionBar;
