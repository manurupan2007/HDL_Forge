export const SITE_NAME = "HDL Forge";
export const SITE_TAGLINE = "Learn Verilog in the browser.";
export const SITE_DESCRIPTION =
  "An open-access, browser-native Verilog learning platform. Guided chapters with instant simulation feedback, unguided problem sets graded against a hidden testbench, and a verified certificate of completion.";

/**
 * Canonical origin. metadataBase, sitemap, robots, OG URLs and the
 * certificate share-link all derive from this, so preview and production
 * agree as long as NEXT_PUBLIC_SITE_URL matches the deployment.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://hdlforge.dev";

/**
 * Public feedback channel (GitHub Issues). Deliberately env-gated: the
 * footer link hides itself until the repository URL is set, so a wrong
 * placeholder never ships.
 */
export const FEEDBACK_URL = process.env.NEXT_PUBLIC_FEEDBACK_URL || "";

export const NAV_LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/certificate", label: "Certificate" },
  { href: "/about", label: "About" },
] as const;

export const SIMULATION_STEPS = ["Compile", "Lint"] as const;

export const SIGNALS = [
  { name: "clk", width: 1 },
  { name: "rst_n", width: 1 },
  { name: "a", width: 4 },
  { name: "b", width: 4 },
  { name: "y", width: 4 },
] as const;

export const EDITOR_FILES = ["top.sv", "top_tb.sv"] as const;