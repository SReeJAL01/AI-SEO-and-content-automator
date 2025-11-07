import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface Props {
  message: string;
}

const Loader: React.FC<Props> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <SparklesIcon className="w-16 h-16 text-blue-400 animate-pulse" />
      <h2 className="text-2xl font-bold text-white mt-6">Processing...</h2>
      <p className="text-zinc-400 mt-2 max-w-sm">{message}</p>
    </div>
  );
};

export default Loader;