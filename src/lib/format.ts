export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
export const fileSize = (b?: number | null) =>
  !b ? "Size not set" : b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.ceil(b / 1024) + " KB";
export const cleanQuery = (q: string) => q.replace(/[%,()*\\]/g, " ").trim().slice(0, 60);
