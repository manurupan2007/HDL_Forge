import type { LessonTestSpec } from "../types";
import { mergeMaps } from "../types";
import { LESSONS_CH1 } from "./ch1";
import { LESSONS_CH2 } from "./ch2";
import { LESSONS_CH3 } from "./ch3";
import { LESSONS_CH4 } from "./ch4";
import { LESSONS_CH5 } from "./ch5";
import { LESSONS_CH6 } from "./ch6";
import { LESSONS_CH7 } from "./ch7";
import { LESSONS_CH8 } from "./ch8";
import { LESSONS_CH9 } from "./ch9";
import { LESSONS_CH10 } from "./ch10";
import { LESSONS_CH11 } from "./ch11";
import { LESSONS_CH12 } from "./ch12";
import { LESSONS_CH13 } from "./ch13";
import { LESSONS_CH14 } from "./ch14";
import { LESSONS_CH15 } from "./ch15";

export const LESSON_TESTS_ALL: Record<string, LessonTestSpec> = mergeMaps([
  LESSONS_CH1,
  LESSONS_CH2,
  LESSONS_CH3,
  LESSONS_CH4,
  LESSONS_CH5,
  LESSONS_CH6,
  LESSONS_CH7,
  LESSONS_CH8,
  LESSONS_CH9,
  LESSONS_CH10,
  LESSONS_CH11,
  LESSONS_CH12,
  LESSONS_CH13,
  LESSONS_CH14,
  LESSONS_CH15,
]);