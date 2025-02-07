import { motion } from 'framer-motion';

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const loadingCircleVariants = {
  start: {
    y: '0%',
  },
  end: {
    y: '100%',
  },
};

const loadingCircleTransition = {
  duration: 0.5,
  repeat: Infinity,
  repeatType: 'reverse',
  ease: 'easeInOut',
};

const LoadingPage = () => {
  return (
    <motion.div
      className="flex justify-center items-center h-screen"
      variants={loadingContainerVariants}
      initial="start"
      animate="end"
    >
      <motion.span
        className="block w-5 h-5 m-1 bg-primaryColor rounded-full"
        variants={loadingCircleVariants}
        transition={loadingCircleTransition}
      />
      <motion.span
        className="block w-5 h-5 m-1 bg-primaryColor rounded-full"
        variants={loadingCircleVariants}
        transition={loadingCircleTransition}
      />
      <motion.span
        className="block w-5 h-5 m-1 bg-primaryColor rounded-full"
        variants={loadingCircleVariants}
        transition={loadingCircleTransition}
      />
    </motion.div>
  );
};

export default LoadingPage;