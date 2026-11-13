import { mergeMaps } from "../types";
import { SOLUTIONS_CH1 } from "./ch1";
import { SOLUTIONS_CH2 } from "./ch2";
import { SOLUTIONS_CH3 } from "./ch3";
import { SOLUTIONS_CH4 } from "./ch4";
import { SOLUTIONS_CH5 } from "./ch5";
import { SOLUTIONS_CH6 } from "./ch6";
import { SOLUTIONS_CH7 } from "./ch7";
import { SOLUTIONS_CH8 } from "./ch8";
import { SOLUTIONS_CH9 } from "./ch9";
import { SOLUTIONS_CH10 } from "./ch10";
import { SOLUTIONS_CH11 } from "./ch11";
import { SOLUTIONS_CH12 } from "./ch12";
import { SOLUTIONS_CH13 } from "./ch13";
import { SOLUTIONS_CH14 } from "./ch14";
import { SOLUTIONS_CH15 } from "./ch15";

export const SOLUTIONS_ALL: Record<string, string> = mergeMaps([
  SOLUTIONS_CH1,
  SOLUTIONS_CH2,
  SOLUTIONS_CH3,
  SOLUTIONS_CH4,
  SOLUTIONS_CH5,
  SOLUTIONS_CH6,
  SOLUTIONS_CH7,
  SOLUTIONS_CH8,
  SOLUTIONS_CH9,
  SOLUTIONS_CH10,
  SOLUTIONS_CH11,
  SOLUTIONS_CH12,
  SOLUTIONS_CH13,
  SOLUTIONS_CH14,
  SOLUTIONS_CH15,
]);