import { RiReactjsLine, RiTailwindCssFill } from "react-icons/ri";
import { FaPython, FaNodeJs } from "react-icons/fa";
import { TbBrandJavascript } from "react-icons/tb";
import { SiMysql, SiFigma } from "react-icons/si";
import { motion } from "framer-motion";

// Wave animation with staggered delay
const jumping = (delay = 0) => ({
  initial: { y: 0 },
  animate: {
    y: [10, -10, 10],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
      delay,
    },
  },
});

const Technologies = () => {
  return (
    <div className="border-b border-neutral-800 pb-24">

      <motion.h1
        whileInView={{ opacity:1, y:0}}
        initial={{opacity:0, y:-100}}
        transition={{ duration:1.5}}
       className="my-20 text-center text-4xl">
        Tech <span className="text-neutral-500">Stack</span>
      </motion.h1>

      <motion.div
        whileInView={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: -100 }}
        transition={{ duration: 1.5 }}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <motion.div
          variants={jumping(0)}
          initial="initial"
          animate="animate"
          className="rounded-2xl border-4 border-neutral-800 p-4"
        >
          <RiReactjsLine className="text-7xl text-cyan-400" />
        </motion.div>

        <motion.div
          variants={jumping(0.2)}
          initial="initial"
          animate="animate"
          className="rounded-2xl border-4 border-neutral-800 p-4"
        >
          <FaPython className="text-7xl text-green-500" />
        </motion.div>

        <motion.div
          variants={jumping(0.4)}
          initial="initial"
          animate="animate"
          className="rounded-2xl border-4 border-neutral-800 p-4"
        >
          <TbBrandJavascript className="text-7xl text-orange-500" />
        </motion.div>

        <motion.div
          variants={jumping(0.6)}
          initial="initial"
          animate="animate"
          className="rounded-2xl border-4 border-neutral-800 p-4"
        >
          <RiTailwindCssFill className="text-7xl text-blue-400" />
        </motion.div>

        <motion.div
          variants={jumping(0.8)}
          initial="initial"
          animate="animate"
          className="rounded-2xl border-4 border-neutral-800 p-4"
        >
          <SiFigma className="text-7xl text-purple-500" />
        </motion.div>

        <motion.div
          variants={jumping(1.0)}
          initial="initial"
          animate="animate"
          className="rounded-2xl border-4 border-neutral-800 p-4"
        >
          <FaNodeJs className="text-7xl text-green-600" />
        </motion.div>

        <motion.div
          variants={jumping(1.2)}
          initial="initial"
          animate="animate"
          className="rounded-2xl border-4 border-neutral-800 p-4"
        >
          <SiMysql className="text-7xl text-orange-600" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Technologies;
