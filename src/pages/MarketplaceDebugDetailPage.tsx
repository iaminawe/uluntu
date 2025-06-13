import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../api/supabaseUtils';
import { ContentContainer } from '../components/ui/PageLayout';
import { Card } from '../components/ui/Card';

type ListingDetail = {
  id: string;
  title: string;
  description: string | null;
  type: string | null;
  price: number | null;
  condition: string | null;
  images: string[] | null;
  created_at: string | null;
  location: string | null;
  tags: string[] | null;
  seller_id: string | null;
  seller_name?: string;
  seller_image?: string;
  updated_at?: string | null;
  featured?: boolean | null;
};

export default function MarketplaceDebugDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      if (!id) {
        setError("No listing ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('Fetching listing with ID:', id);

      try {
        // Basic query first
        const { data: basicData, error: basicError } = await supabase
          .from('marketplace_listings')
          .select('*')
          .eq('id', id)
          .single();

        console.log('Basic query result:', { data: basicData, error: basicError });

        if (basicError) {
          console.error('Error fetching listing:', basicError);
          setError(basicError.message);
          setLoading(false);
          return;
        }

        if (!basicData) {
          setError('Listing not found');
          setLoading(false);
          return;
        }

        // Get seller info if available
        let sellerName = 'Unknown Seller';
        let sellerImage = '/placeholder-avatar.png';

        if (basicData.seller_id) {
          const { data: sellerData } = await supabase
            .from('members')
            .select('name, image')
            .eq('id', basicData.seller_id)
            .single();

          if (sellerData) {
            sellerName = sellerData.name || sellerName;
            sellerImage = sellerData.image || sellerImage;
          }
        }

        // Combine data
        setListing({
          ...basicData,
          seller_name: sellerName,
          seller_image: sellerImage
        });
      } catch (err) {
        console.error('Exception in fetchListing:', err);
        setError('Failed to fetch listing');
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <ContentContainer>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-pulse text-xl">Loading listing...</div>
        </div>
      </ContentContainer>
    );
  }

  if (error || !listing) {
    return (
      <ContentContainer>
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Listing</h1>
          <p className="mb-4">{error || 'Listing not found'}</p>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Debug Information:</h2>
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto">
              ID from URL: {id || 'No ID found'}
            </pre>
          </div>
          <Link to="/marketplace" className="text-blue-500 hover:underline">
            Return to Marketplace
          </Link>
        </Card>
      </ContentContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{listing.title} - Marketplace Debug</title>
      </Helmet>

      <ContentContainer>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <Link to="/marketplace" className="text-blue-500 hover:underline">
            Back to Marketplace
          </Link>
        </div>

        <Card className="mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title}
                    className="w-full h-auto rounded-lg object-cover" 
                  />
                ) : (
                  <div className="bg-slate-200 dark:bg-slate-700 h-64 w-full rounded-lg flex items-center justify-center">
                    No image available
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">{listing.title}</h2>
                  <span className="text-orange-500 text-xl font-medium">
                    ${listing.price?.toFixed(2) || 'Price on request'}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {listing.type || 'Product'}
                  </span>
                  {listing.condition && (
                    <span className="inline-block ml-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                      {listing.condition}
                    </span>
                  )}
                </div>

                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {listing.description || 'No description available'}
                </p>

                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={listing.seller_image || '/placeholder-avatar.png'} 
                      alt="Seller" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{listing.seller_name || 'Unknown Seller'}</p>
                    <p className="text-sm text-slate-500">{listing.location || 'Location not specified'}</p>
                  </div>
                </div>

                {listing.tags && listing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {listing.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700
                                 text-slate-600 dark:text-slate-300 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto">
              {JSON.stringify(listing, null, 2)}
            </pre>
          </div>
        </Card>
      </ContentContainer>
    </>
  );
}
