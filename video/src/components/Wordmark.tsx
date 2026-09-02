import { Img, staticFile } from "remotion";

// The 2000x485 brand wordmark. Width alone keeps the aspect ratio.
export const Wordmark: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <Img
    src={staticFile("unpackmath-wordmark.png")}
    style={{ width, height: "auto", display: "block", ...style }}
  />
);
