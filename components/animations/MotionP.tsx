"use client";

import React from "react";
import { motion } from "framer-motion";
import { FMotion } from "@/types/animation.types";

const MotionP = ({ children, ...props }: FMotion) => {
  return <motion.p {...props}>{children}</motion.p>;
};
export default MotionP;
