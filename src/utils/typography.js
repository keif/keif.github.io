import Typography from "typography";

const typography = new Typography({
  baseFontSize: "18px",
  baseLineHeight: 1.7,
  headerFontFamily: ["Raleway", "sans-serif"],
  bodyFontFamily: ["Roboto Slab", "sans-serif"],
  scaleRatio: 3
});

const { rhythm, scale } = typography;
export { rhythm, scale, typography as default };
