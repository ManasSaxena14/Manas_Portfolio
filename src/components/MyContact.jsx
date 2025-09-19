import React, { useState } from 'react';
import { CONTACT } from '../constants';
import { motion } from 'framer-motion';

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTACT.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-b border-neutral-500 pb-20 mt-30 mb-10">
      <motion.h1 
      whileInView={{ opacity:1, y:0}}
      initial={{opacity:0, y:-100}}
      transition={{ duration:0.5}}
      className="my-10 text-center text-4xl text-neutral-300">
        Get In Touch
      </motion.h1>

      <div className="text-center tracking-tighter  p-6 rounded-xl flex flex-col items-center">
        <p className="my-4 underline text-neutral-300 text-lg">{CONTACT.email}</p>
        <button
          onClick={handleCopy}
          className="mt-2 px-4 py-2 border border-neutral-300 text-neutral-300 rounded-md text-sm font-medium w-[5rem] transition duration-300 ease-in-out hover:bg-[rgba(38,198,218,0.5)] hover:shadow-[0_0_15px_rgba(38,198,218,0.6)]">
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

export default Contact;
