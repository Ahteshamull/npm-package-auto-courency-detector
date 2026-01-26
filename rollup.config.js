export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/currency-detector.umd.js",
      format: "umd",
      name: "CurrencyDetector",
    },
    {
      file: "dist/currency-detector.esm.js",
      format: "esm",
    },
  ],
};
