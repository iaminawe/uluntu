import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  image?: string;
  link?: string;
  color?: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  image,
  link,
  color = 'orange',
  delay = 0
}) => {
  const colorClasses = {
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600'
  };

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="relative h-full overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-xl hover:shadow-2xl transition-shadow duration-300"
    >
      {/* Background Image with Overlay */}
      {image && (
        <div className="absolute inset-0">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover opacity-10 dark:opacity-5"
          />
        </div>
      )}

      {/* Icon Background */}
      <div className="relative p-8">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.8 }}
          className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} shadow-lg`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>

        {/* Link Indicator */}
        {link && (
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
            className="mt-6 flex items-center text-orange-500 font-semibold"
          >
            <span>Learn More</span>
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-10 blur-3xl`} />
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

export default FeatureCard;