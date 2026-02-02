import {
  LegacyAnimationControls,
  TargetAndTransition,
  VariantLabels,
  Variants,
  ViewportOptions,
} from "framer-motion";
import { Property } from "csstype";
import Transition = Property.Transition;
import { ReactNode } from "react";

export type FMotion = {
  className?: string;
  animate?:
    | boolean
    | TargetAndTransition
    | VariantLabels
    | LegacyAnimationControls
    | undefined;
  transition?: Transition<any> | undefined;
  variants?: Variants | undefined;
  initial?: boolean | TargetAndTransition | VariantLabels | undefined;
  whileHover?: TargetAndTransition | VariantLabels | undefined;
  whileTap?: TargetAndTransition | VariantLabels | undefined;
  whileInView?: TargetAndTransition | VariantLabels | undefined;
  viewport?: ViewportOptions | undefined;
  children?: ReactNode;
};
