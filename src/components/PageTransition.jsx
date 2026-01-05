import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    initial: {
        opacity: 0,
        y: 10,
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1], // New "Ultra Smooth" Curve
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.2,
            ease: "easeIn"
        }
    }
};

const PageTransition = ({ children, className = "" }) => {
    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="enter"
            exit="exit"
            className={`w-full h-full ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
