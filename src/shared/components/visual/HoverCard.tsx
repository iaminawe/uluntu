import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface HoverCardProps {
  image: string;
  title: string;
  category?: string;
  description?: string;
  link?: string;
  tags?: string[];
  hoverEffect?: 'zoom' | 'slide' | 'flip' | 'tilt';
  className?: string;
}

const HoverCard: React.FC<HoverCardProps> = ({
  image,
  title,
  category,
  description,
  link,
  tags = [],
  hoverEffect = 'zoom',
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardContent = (
    <motion.div
      className={`relative h-full overflow-hidden rounded-xl bg-slate-900 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={hoverEffect === 'tilt' ? { 
        rotateX: -5,
        rotateY: 5,
        scale: 1.02
      } : {}}
      transition={{ duration: 0.3 }}
      style={hoverEffect === 'tilt' ? { transformStyle: 'preserve-3d' } : {}}
    >
      {/* Image */}
      <div className="relative h-full">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          animate={{
            scale: isHovered && hoverEffect === 'zoom' ? 1.1 : 1,
            x: isHovered && hoverEffect === 'slide' ? -20 : 0
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Gradient Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: isHovered ? 0.9 : 0.3 }}
          transition={{ duration: 0.3 }}
        />

        {/* Category Badge */}
        {category && (
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
              {category}
            </span>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
          {/* Title - Always Visible */}
          <motion.h3
            className="text-2xl font-bold text-white mb-2"
            animate={{
              y: isHovered ? -10 : 0
            }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>

          {/* Additional Content - Visible on Hover */}
          <AnimatePresence>
            {isHovered && (
              <>
                {description && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-slate-200 mb-4"
                  >
                    {description}
                  </motion.p>
                )}

                {tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex flex-wrap gap-2 mb-4"
                  >
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex items-center text-orange-400 font-semibold"
                >
                  <span>View Details</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Decorative Elements */}
        <AnimatePresence>
          {isHovered && hoverEffect === 'flip' && (
            <motion.div
              initial={{ opacity: 0, rotateY: 180 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -180 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-600/20"
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  if (link) {
    return (
      <Link to={link} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default HoverCard;