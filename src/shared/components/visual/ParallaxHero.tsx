import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ParallaxHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage: string;
  foregroundImage?: string;
  height?: 'full' | 'large' | 'medium';
  actions?: Array<{
    label: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'ghost';
  }>;
}

const ParallaxHero: React.FC<ParallaxHeroProps> = ({
  title,
  subtitle,
  description,
  backgroundImage,
  foregroundImage,
  height = 'large',
  actions = []
}) => {
  const [windowHeight, setWindowHeight] = useState(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Parallax transforms
  const backgroundY = useTransform(scrollY, [0, windowHeight], [0, windowHeight * 0.5]);
  const contentY = useTransform(scrollY, [0, windowHeight], [0, windowHeight * 0.3]);
  const opacity = useTransform(scrollY, [0, windowHeight * 0.8], [1, 0]);

  const heightClasses = {
    full: 'h-screen',
    large: 'h-[90vh]',
    medium: 'h-[70vh]'
  };

  return (
    <section className={`relative ${heightClasses[height]} overflow-hidden`}>
      {/* Background Layer */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0"
      >
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-slate-900/30" />
      </motion.div>

      {/* Foreground Layer (optional) */}
      {foregroundImage && (
        <motion.div
          style={{ y: useTransform(scrollY, [0, windowHeight], [0, windowHeight * 0.2]) }}
          className="absolute inset-0 z-10 pointer-events-none"
        >
          <img
            src={foregroundImage}
            alt=""
            className="w-full h-full object-cover opacity-50"
          />
        </motion.div>
      )}

      {/* Content Layer */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-20 h-full flex items-center"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-orange-400 font-semibold text-lg mb-4"
              >
                {subtitle}
              </motion.p>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              {title}
            </motion.h1>

            {description && (
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl text-slate-200 mb-8 leading-relaxed"
              >
                {description}
              </motion.p>
            )}

            {actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                {actions.map((action, index) => {
                  const baseClasses = "px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300";
                  const variantClasses = {
                    primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105",
                    secondary: "bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20",
                    ghost: "text-white hover:bg-white/10"
                  };

                  return (
                    <Link
                      key={index}
                      to={action.href}
                      className={`${baseClasses} ${variantClasses[action.variant || 'primary']}`}
                    >
                      {action.label}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent z-30" />
      
      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-10 w-20 h-20 bg-orange-500/20 rounded-full blur-2xl"
      />
      
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-40 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"
      />
    </section>
  );
};

export default ParallaxHero;