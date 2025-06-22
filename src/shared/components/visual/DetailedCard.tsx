import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, User, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailedCardProps {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  date?: string;
  author?: {
    name: string;
    image?: string;
  };
  category?: string;
  readTime?: string;
  link: string;
  linkText?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export function DetailedCard({
  id,
  title,
  excerpt,
  image,
  date,
  author,
  category,
  readTime,
  link,
  linkText = 'Read More',
  className,
  variant = 'default'
}: DetailedCardProps) {
  const isCompact = variant === 'compact';

  return (
    <article
      className={cn(
        'group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300',
        'border border-slate-200 dark:border-slate-700',
        className
      )}
    >
      {/* Image */}
      <Link to={link} className="block relative overflow-hidden">
        <div className={cn(
          "relative bg-slate-100 dark:bg-slate-700",
          isCompact ? "aspect-[16/9]" : "aspect-[16/10]"
        )}>
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-slate-400" />
            </div>
          )}
          
          {/* Category Badge */}
          {category && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                {category}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className={cn(
        "p-6",
        isCompact && "p-4"
      )}>
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
          {date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={date}>
                {new Date(date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>
          )}
          
          {readTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{readTime}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors",
          isCompact ? "text-lg" : "text-xl"
        )}>
          <Link to={link}>
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className={cn(
          "text-slate-600 dark:text-slate-400 line-clamp-3 mb-4",
          isCompact && "text-sm line-clamp-2"
        )}>
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Author */}
          {author && (
            <div className="flex items-center gap-2">
              {author.image ? (
                <img
                  src={author.image}
                  alt={author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
              )}
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {author.name}
              </span>
            </div>
          )}

          {/* Read More Link */}
          <Link
            to={link}
            className={cn(
              "inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium transition-colors",
              author && "ml-auto"
            )}
          >
            <span className={isCompact ? "text-sm" : ""}>{linkText}</span>
            <ArrowRight className={cn(
              "transition-transform group-hover:translate-x-1",
              isCompact ? "w-4 h-4" : "w-5 h-5"
            )} />
          </Link>
        </div>
      </div>
    </article>
  );
}