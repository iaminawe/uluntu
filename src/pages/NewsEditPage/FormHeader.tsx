import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FormHeaderProps } from './types';

const FormHeader: React.FC<FormHeaderProps> = ({ isEditMode, title }) => {
  return (
    <div className="mb-8">
      <Link 
        to="/news" 
        className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to News
      </Link>
      
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        {isEditMode ? `Edit Article: ${title}` : 'Create New Article'}
      </h1>
    </div>
  );
};

export default FormHeader;
