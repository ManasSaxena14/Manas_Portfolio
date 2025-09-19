import aboutImg from "../assets/About.jpeg" 
import { ABOUT_TEXT } from "../constants";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="border-b border-neutral-900 pb-4">
      <h1 className="my-20 text-center text-4xl">
        About <span className="text-neutral-500">Me</span>
      </h1>

      <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-12">
        <motion.div
          whileInView={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: -80 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="w-full lg:w-1/2 flex justify-center lg:justify-start"
        >
          <div className="relative">
            <img
              src={aboutImg}
              alt="about"
              className="rounded-2xl opacity-90 brightness-80 shadow-2xl shadow-neutral-900/50 w-full max-w-lg h-auto"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-transparent"></div>
          </div>
        </motion.div>

        <motion.div
          whileInView={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: 80 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
          className="w-full lg:w-1/2 flex items-center justify-center lg:justify-start"
        >
          <div className="space-y-5 w-full max-w-2xl">
            <p className="text-lg leading-relaxed text-neutral-300 font-light">
              <span className="text-cyan-400 font-medium">I'm a second-year student</span> pursuing B-Tech in Artificial Intelligence and Machine Learning, passionate about tech and innovation, currently exploring the world of software development through hands-on learning and real-world projects.
            </p>
            <p className="text-lg leading-relaxed text-neutral-300 font-light">
              I enjoy solving problems, building <span className="text-cyan-400 font-medium">clean and efficient user interfaces</span>, and constantly experimenting to expand my skill set. My current toolkit includes Python for DSA and scripting, along with the MERN stack for full-stack development.
            </p>
            <p className="text-lg leading-relaxed text-neutral-300 font-light">
              I've solved over <span className="text-cyan-400 font-medium">150 problems on LeetCode</span>, sharpening my problem-solving and algorithmic thinking. Beyond academics, I serve as the Vice President of my college's Finance Club, where I contribute to leadership, strategy, and collaborative growth.
            </p>
            <p className="text-lg leading-relaxed text-neutral-300 font-light">
              Over time, I've developed strong <span className="text-cyan-400 font-medium">leadership and teamwork abilities</span>, communication skills, and effective time management and discipline that help me balance academics, projects, and responsibilities.
            </p>
            <p className="text-lg leading-relaxed text-neutral-300 font-light">
              Outside the classroom, I've also represented my state in <span className="text-cyan-400 font-medium">Cricket and Football</span>, experiences that further shaped my discipline, resilience, and collaborative spirit.
            </p>
            <p className="text-lg leading-relaxed text-neutral-300 font-light">
              I'm always on the lookout for opportunities to learn something new or improve what I've built. I believe in developing projects that everyone can use to ease their life, something with a purpose. I love what I do because it challenges me to think creatively, grow constantly, and turn ideas into reality.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
