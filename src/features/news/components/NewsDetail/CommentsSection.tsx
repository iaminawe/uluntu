import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { NewsArticle } from './types';
import { getMemberProfileUrl } from '@/utils/memberSlugUtils';

interface CommentsSectionProps {
  article: NewsArticle;
  onAddComment: () => void;
}

const CommentsSection = ({ article, onAddComment }: CommentsSectionProps) => {
  const [likedComments, setLikedComments] = useState<number[]>([]);

  const toggleLike = (commentId: number) => {
    if (likedComments.includes(commentId)) {
      setLikedComments(likedComments.filter(id => id !== commentId));
    } else {
      setLikedComments([...likedComments, commentId]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Comments ({article.comments.length})
        </h2>
        <button
          onClick={onAddComment}
          className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 
                   text-white rounded-md transition-colors"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Comment
        </button>
      </div>

      {article.comments.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">
            Be the first to add a comment!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {article.comments.map((comment) => (
            <div key={comment.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-start mb-3">
                <Link to={getMemberProfileUrl(comment.author)}>
                  <img
                    src={comment.author.image}
                    alt={comment.author.name}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        to={getMemberProfileUrl(comment.author)}
                        className="font-medium text-slate-900 dark:text-white hover:text-orange-500 
                                dark:hover:text-orange-400"
                      >
                        {comment.author.name}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pl-13 ml-13">
                <p className="text-slate-700 dark:text-slate-300 mb-3">{comment.content}</p>
                <div className="flex items-center text-sm">
                  <button
                    onClick={() => toggleLike(comment.id)}
                    className={`flex items-center mr-4 ${
                      likedComments.includes(comment.id)
                        ? 'text-orange-500'
                        : 'text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Like
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
