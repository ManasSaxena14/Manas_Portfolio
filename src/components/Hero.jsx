import { HERO_CONTENT } from "../constants";
import ProfilePic from "../assets/Profile.jpeg";
import { motion } from "framer-motion";

const fadeInLeft = (delay = 0) => ({
  hidden: { x: -60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      delay,
      duration: 0.8,
      ease: "easeInOut",
    },
  },
});

const fadeInRight = {
  hidden: { x: 60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      delay: 1.2,
      duration: 1,
      ease: "easeInOut",
    },
  },
};

const Hero = () => {
  return (
    <div className="border-b border-neutral-900 pb-4 lg:mb-35">
      <div className="flex flex-wrap">
        {/* Left Section */}
        <div className="w-full lg:w-[55%]">
          <div className="flex flex-col items-center lg:items-start">
            <motion.h1
              variants={fadeInLeft(0)}
              initial="hidden"
              animate="visible"
              className="break-words text-6xl xl:text-7xl 2xl:text-8xl font-thin text-white pb-12 lg:mt-12 mb-0 leading-tight"
            >
              Manas Saxena
            </motion.h1>

            <motion.span
              variants={fadeInLeft(0.4)}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-r from-pink-300 via-slate-500 to-purple-500 bg-clip-text text-4xl tracking-tight text-transparent"
            >
              Emerging Full Stack Developer and Competitive Programmer
            </motion.span>

            <motion.p
              variants={fadeInLeft(0.8)}
              initial="hidden"
              animate="visible"
              className="my-2 max-w-xl py-6 font-light tracking-tighter text-neutral-300 text-lg leading-relaxed"
            >
              {HERO_CONTENT}
            </motion.p>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-[45%] lg:p-8">
          <div className="flex justify-center">
            <motion.img
              variants={fadeInRight}
              initial="hidden"
              animate="visible"
              src={ProfilePic}
              alt="profile_picture"
              className="rounded-2xl opacity-90 brightness-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
