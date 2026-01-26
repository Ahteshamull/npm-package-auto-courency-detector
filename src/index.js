import { detectByIp } from "./detectIp";
import { convertPrice } from "./convertPrice";

const CurrencyDetector = {
  async detect() {
    return await detectByIp();
  },

  async convert({ amount, from = "USD" }) {
    // Validate amount
    if (!amount || isNaN(amount)) {
      return {
        error: "Invalid amount provided",
        original: amount,
      };
    }

    const geo = await detectByIp();

    // If detection failed, return error
    if (geo.error) {
      return {
        error: "Failed to detect location",
        original: amount,
        geo,
      };
    }

    const converted = await convertPrice(amount, from, geo.currency);

    return {
      // Location info
      ip: geo.ip,
      country: geo.country,
      countryName: geo.countryName,
      region: geo.region,
      city: geo.city,

      // Currency info
      currency: geo.currency,
      symbol: geo.symbol,

      // Conversion info
      original: parseFloat(amount),
      fromCurrency: from.toUpperCase(),
      converted: converted.amount,
      rate: converted.rate,

      // Error handling
      error: converted.error || null,
    };
  },

  async init(options = {}) {
    const geo = await detectByIp();

    if (typeof options.onDetect === "function") {
      options.onDetect(geo);
    }

    return geo;
  },

  // Helper method to get currency info for any country
  getCurrencyInfo(countryCode) {
    const { countryToCurrency } = require("./currencyMap");
    const code = countryCode?.toUpperCase();
    return countryToCurrency[code] || { currency: "USD", symbol: "$" };
  },
};

export default CurrencyDetector;
