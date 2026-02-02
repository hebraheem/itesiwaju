"use client";

import React from "react";
import { motion } from "framer-motion";
import { FMotion } from "@/types/animation.types";

const MotionDiv = ({ children, ...props }: FMotion) => {
  return <motion.div {...props}>{children}</motion.div>;
};
export default MotionDiv;
