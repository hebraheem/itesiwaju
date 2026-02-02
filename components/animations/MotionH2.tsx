"use client";

import React from "react";
import { motion } from "framer-motion";
import { FMotion } from "@/types/animation.types";

const MotionH2 = ({ children, ...props }: FMotion) => {
  return <motion.h2 {...props}>{children}</motion.h2>;
};
export default MotionH2;
