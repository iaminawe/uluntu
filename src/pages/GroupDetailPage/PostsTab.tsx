import { PostsTabProps } from './types';

const PostsTab: React.FC<PostsTabProps> = ({ posts, isLoading }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Group Posts</h2>
      
      {isLoading ? (
        <div className="animate-pulse space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-slate-200 dark:bg-slate-700 h-40 rounded-lg"></div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">No posts have been shared in this group yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.isArray(posts) && posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={post.author.image}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {post.author.name}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {post.excerpt}
                </p>
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <button className="text-orange-500 font-medium hover:text-orange-600">
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsTab;
