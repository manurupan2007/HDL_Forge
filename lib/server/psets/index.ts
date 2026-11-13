import type { PSetTestSpec } from "../../tests-content/types";
import { mergeMaps } from "../../tests-content/types";
import { PSETS_CH1 } from "./ch1";
import { PSETS_CH2 } from "./ch2";
import { PSETS_CH3 } from "./ch3";
import { PSETS_CH4 } from "./ch4";
import { PSETS_CH5 } from "./ch5";
import { PSETS_CH6 } from "./ch6";
import { PSETS_CH7 } from "./ch7";
import { PSETS_CH8 } from "./ch8";
import { PSETS_CH9 } from "./ch9";
import { PSETS_CH10 } from "./ch10";
import { PSETS_CH11 } from "./ch11";
import { PSETS_CH12 } from "./ch12";
import { PSETS_CH13 } from "./ch13";
import { PSETS_CH14 } from "./ch14";
import { PSETS_CH15 } from "./ch15";

/** All hidden pset benches by "chapterSlug:psetSlug". Server-only. */
export const PSETS_ALL: Record<string, PSetTestSpec> = mergeMaps([
  PSETS_CH1,
  PSETS_CH2,
  PSETS_CH3,
  PSETS_CH4,
  PSETS_CH5,
  PSETS_CH6,
  PSETS_CH7,
  PSETS_CH8,
  PSETS_CH9,
  PSETS_CH10,
  PSETS_CH11,
  PSETS_CH12,
  PSETS_CH13,
  PSETS_CH14,
  PSETS_CH15,
]);