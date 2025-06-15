import React, { useState, useEffect, useId } from "react";

import { motion } from "motion/react";
import { cn } from "../lib/utils";

export interface ContainerTextFlipProps {
  /** Array of words to cycle through in the animation */
  words?: string[];
  /** Time in milliseconds between word transitions */
  interval?: number;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Additional CSS classes to apply to the text */
  textClassName?: string;
  /** Duration of the transition animation in milliseconds */
  animationDuration?: number;
}

export function ContainerTextFlip({
  words = ["Solve", "Code", "Grow"

  ],
  interval = 1500,
  className,
  textClassName,
  animationDuration = 700,
}: ContainerTextFlipProps) {
  const id = useId();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [width, setWidth] = useState(100);
  const textRef = React.useRef<HTMLDivElement>(null);

  const updateWidthForWord = () => {
    if (textRef.current) {
      // Add some padding to the text width (30px on each side)
      const textWidth = textRef.current.scrollWidth + 30;
      setWidth(textWidth);
    }
  };
  const colors = [
    "rgb(131, 179, 32)",
    "rgb(47, 195, 106)",
    "rgb(42, 169, 210)",
    "rgb(4, 112, 202)",
    "rgb(107, 10, 255)",
    "rgb(183, 0, 218)",
    "rgb(218, 0, 171)",
    "rgb(230, 64, 92)",
    "rgb(232, 98, 63)",
    "rgb(249, 129, 47)",
  ];
 
  const [currentColors, setCurrentColors] = React.useState(colors);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [count, setCount] = React.useState(0);
 
  React.useEffect(() => {
    const interval = setInterval(() => {
      const shuffled = [...colors].sort(() => Math.random() - 0.5);
      setCurrentColors(shuffled);
      setCount((prev) => prev + 1);
    }, 5000);
 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update width whenever the word changes
    updateWidthForWord();
  }, [currentWordIndex]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      // Width will be updated in the effect that depends on currentWordIndex
    }, interval);

    return () => clearInterval(intervalId);
  }, [words, interval]);

  return (
    <motion.p
      layout
      layoutId={`words-here-${id}`}
      animate={{ width }}
      transition={{ duration: animationDuration / 2000 }}
      className={cn(
        "relative inline-block rounded-lg pt-2 pb-3  text-2xl font-bold text-black md:text-5xl dark:text-white",
        "",
        "",
        "",
        "",
        className,
      )}
      key={words[currentWordIndex]}
    >
      <motion.div
        transition={{
          duration: animationDuration / 1000,
          ease: "easeInOut",
        }}
        className={cn("inline-block", textClassName)}
        ref={textRef}
        layoutId={`word-div-${words[currentWordIndex]}-${id}`}
      >
        <motion.div className="inline-block font-trade-winds">
            Welcome to Coke Forces, {" "}
          {words[currentWordIndex].split("").map((letter, index) => (
            <motion.span
              key={index}
              style={{ color: currentColors[index % currentColors.length] }}
              className="whitespace-pre font-sans tracking-tight"
              initial={{
                opacity: 0,
                // filter: "blur(10px)",
                y: 1
              }}
              animate={{
                
                
                y: [0, -3, 0],
        scale: [1, 1.01, 1],
        filter: ["blur(0px)", `blur(5px)`, "blur(0px)"],
        opacity: [1, 0.8, 1],
              }}
              transition={{
                
                  duration: 0.5,
        delay: index * 0.05,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Where we solve problems, code solutions, and grow together!
        </div>
      </motion.div>
    </motion.p>
  );
}
