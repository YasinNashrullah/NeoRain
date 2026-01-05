import React from 'react';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={`animate-pulse bg-slate-200 dark:bg-slate-700/50 rounded-xl ${className}`}
            {...props}
        />
    );
};

export default Skeleton;
