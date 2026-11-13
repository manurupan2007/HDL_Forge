import { mergeMaps } from "../types";
import { PSET_SOLUTIONS_CH1 } from "./ch1";
import { PSET_SOLUTIONS_CH2 } from "./ch2";
import { PSET_SOLUTIONS_CH3 } from "./ch3";
import { PSET_SOLUTIONS_CH4 } from "./ch4";
import { PSET_SOLUTIONS_CH5 } from "./ch5";
import { PSET_SOLUTIONS_CH6 } from "./ch6";
import { PSET_SOLUTIONS_CH7 } from "./ch7";
import { PSET_SOLUTIONS_CH8 } from "./ch8";
import { PSET_SOLUTIONS_CH9 } from "./ch9";
import { PSET_SOLUTIONS_CH10 } from "./ch10";
import { PSET_SOLUTIONS_CH11 } from "./ch11";
import { PSET_SOLUTIONS_CH12 } from "./ch12";
import { PSET_SOLUTIONS_CH13 } from "./ch13";
import { PSET_SOLUTIONS_CH14 } from "./ch14";
import { PSET_SOLUTIONS_CH15 } from "./ch15";

export const PSET_SOLUTIONS_ALL: Record<string, string> = mergeMaps([
  PSET_SOLUTIONS_CH1,
  PSET_SOLUTIONS_CH2,
  PSET_SOLUTIONS_CH3,
  PSET_SOLUTIONS_CH4,
  PSET_SOLUTIONS_CH5,
  PSET_SOLUTIONS_CH6,
  PSET_SOLUTIONS_CH7,
  PSET_SOLUTIONS_CH8,
  PSET_SOLUTIONS_CH9,
  PSET_SOLUTIONS_CH10,
  PSET_SOLUTIONS_CH11,
  PSET_SOLUTIONS_CH12,
  PSET_SOLUTIONS_CH13,
  PSET_SOLUTIONS_CH14,
  PSET_SOLUTIONS_CH15,
]);