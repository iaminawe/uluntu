# Common UI Patterns

This guide documents the common UI patterns used throughout the Kootenay Tech Community application. Following these patterns ensures consistency in structure, behavior, and appearance across the application.

## Page Structure Pattern

Every page in the application should follow this standard structure:

```tsx
import { Helmet } from 'react-helmet-async';
import { ContentContainer, EmptyState } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

export default function ExamplePage() {
  // Data fetching with Tanstack Query
  const { data, isLoading, error } = useExampleData();
  const hasData = data && data.length > 0;
  
  return (
    <>
      {/* SEO metadata */}
      <Helmet>
        <title>Page Title - Kootenay Tech Community</title>
        <meta name="description" content="Page description for SEO" />
      </Helmet>
      
      {/* Page header */}
      <PageHeader />
      
      {/* Main content container */}
      <ContentContainer>
        <ActionBar />
        
        {/* Conditional rendering based on data state */}
        {isLoading ? (
          <SkeletonGrid count={6} columns={{ sm: 1, md: 2, lg: 3 }} />
        ) : error ? (
          <QueryError 
            error={error} 
            retry={() => console.log('Retrying query')} 
            message="We couldn't load the data. Please try again."
          />
        ) : !hasData ? (
          <EmptyState
            title="No Items Found"
            description="There are no items available."
            primaryActionUrl="/create"
            primaryAction={{
              text: "Create Item",
              onClick: () => console.log('Navigate to create')
            }}
          />
        ) : (
          <ItemsList data={data} />
        )}
      </ContentContainer>
    </>
  );
}
```

## Detail Page Pattern

Detail pages follow this structure:

```tsx
export default function ItemDetailPage() {
  const { id } = useParams();
  const { data: item, isLoading, error } = useItemById(id);
  
  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !item) {
    return <ErrorState />;
  }
  
  return (
    <>
      <Helmet>
        <title>{item.title} - Kootenay Tech Community</title>
        <meta name="description" content={item.description.substring(0, 160)} />
      </Helmet>
      
      <ContentContainer>
        <PageHeader id={id} title={item.title} />
        
        <Card className="overflow-hidden">
          <div className="p-8">
            {/* Item details content */}
          </div>
        </Card>
        
        <Card className="mt-8">
          {/* Related items or additional information */}
        </Card>
      </ContentContainer>
    </>
  );
}
```

## Edit/Create Form Pattern

Forms for editing or creating content follow this structure:

```tsx
export default function ItemEditPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Fetch existing data if editing
  const { data: item, isLoading } = useItemById(isEditing ? id : undefined);
  
  // Populate form when data is available
  useEffect(() => {
    if (isEditing && item) {
      setFormData({
        // Map API data to form fields
      });
    }
  }, [isEditing, item]);
  
  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Validation logic
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API call to submit/update
      
      setSubmitSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/items');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading && isEditing) {
    return <LoadingState />;
  }
  
  return (
    <>
      <Helmet>
        <title>
          {isEditing ? `Edit Item: ${item?.name || 'Loading...'}` : 'Create New Item'} - Kootenay Tech Community
        </title>
      </Helmet>
      
      <ContentContainer maxWidth="lg">
        <FormHeader 
          title={isEditing ? `Edit ${item?.name || 'Item'}` : 'Create New Item'}
          backUrl="/items"
        />
        
        {submitSuccess ? (
          <Card className="mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4">
              <p className="text-sm text-green-700 dark:text-green-400">
                {isEditing ? 'Item updated successfully!' : 'Item created successfully!'} Redirecting...
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Form sections and fields */}
              
              <FormActions 
                isEditing={isEditing}
                isSubmitting={isSubmitting}
                submitText={isEditing ? 'Update Item' : 'Create Item'}
                onCancel={() => navigate('/items')}
                showDelete={isEditing}
                onDelete={() => setShowDeleteConfirm(true)}
              />
            </form>
          </Card>
        )}
      </ContentContainer>
      
      {/* Delete confirmation modal if needed */}
    </>
  );
}
```

## List Component Pattern

Components that display lists of items follow this pattern:

```tsx
const ItemsList = ({ filter = '', category = '' }) => {
  const { 
    data = [], 
    isLoading, 
    error,
    refetch
  } = useItems({ filter, category });
  
  if (isLoading) {
    return <SkeletonGrid count={6} />;
  }
  
  if (error) {
    return (
      <QueryError 
        error={error} 
        retry={refetch} 
        message="We couldn't load the items. Please try again."
      />
    );
  }
  
  if (data.length === 0) {
    return (
      <EmptyState
        title="No Items Found"
        description="Try adjusting your filters or search terms."
      />
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};
```

## Tab Interface Pattern

For pages with tabbed interfaces:

```tsx
const TabContent = () => {
  const [selectedTab, setSelectedTab] = useState('about');
  
  return (
    <Card className="overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {selectedTab === 'about' && <AboutTabContent />}
        {selectedTab === 'members' && <MembersTabContent />}
        {selectedTab === 'events' && <EventsTabContent />}
        {/* Additional tabs */}
      </div>
    </Card>
  );
};
```

## Responsive Design Pattern

All components should be designed with mobile-first responsiveness:

1. Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) to adapt layouts at different breakpoints
2. Use grid systems with responsive column counts
3. Stack elements vertically on mobile, horizontally on larger screens

Example:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>

<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
  <div className="w-full sm:w-auto">
    {/* Content */}
  </div>
  <div className="w-full sm:w-auto mt-4 sm:mt-0">
    {/* Content */}
  </div>
</div>
```

## Dark Mode Support

All components should support both light and dark modes:

1. Use Tailwind's dark mode classes (`dark:bg-slate-800`, `dark:text-white`, etc.)
2. Ensure sufficient contrast in both modes
3. Test all components in both light and dark mode

Example:

```tsx
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
  <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200">
    Section Title
  </h2>
  <p className="text-slate-600 dark:text-slate-400">
    Description text
  </p>
</div>
```

## Data Fetching Pattern

Use Tanstack Query for all data fetching:

```tsx
// In hooks/useQueries.ts
export function useItems(params: ItemsParams) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => fetchItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// In component
function ItemsPage() {
  const [filter, setFilter] = useState('');
  const { data, isLoading, error } = useItems({ filter });
  
  // Component rendering logic
}
```

## State Management Pattern

1. Use React Query for server state (data from API)
2. Use React Context for global UI state
3. Use component state (useState) for local UI state
4. Pass callbacks for actions that modify state

Example Context Pattern:

```tsx
// Create context
const UserContext = createContext();

// Provider component
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const login = async (credentials) => {
    // Login logic
  };
  
  const logout = async () => {
    // Logout logic
  };
  
  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the context
export function useUser() {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}
```
