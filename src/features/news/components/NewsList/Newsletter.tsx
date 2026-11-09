import { useState } from 'react';
import { Mail } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the email to a backend service
    setSubscribed(true);
    setEmail('');
    
    // Reset the subscribed state after a few seconds
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <div className="mt-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-8 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
            <Mail className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
        <p className="text-white/80 mb-6">
          Get the latest updates from the Uluntu community, including events, opportunities, and news.
        </p>
        {subscribed ? (
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-lg font-medium">Thanks for subscribing!</p>
            <p className="text-white/80">You'll receive our next newsletter in your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white 
                       placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-white/90 
                       transition-colors font-medium"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Newsletter;
