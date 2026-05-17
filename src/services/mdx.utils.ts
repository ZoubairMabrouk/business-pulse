export const cleanMDX = (raw: string) =>
  (raw || "")
    .replace(/```mdx/g, "")
    .replace(/```/g, "")
    .trim();