import { countryToCurrency } from "./currencyMap";

export async function detectByIp() {
  try {
    // Try multiple IP geolocation services with CORS proxy fallback
    const services = [
      "https://ipapi.co/json/",
      "https://ip-api.com/json/",
      "https://api.ipify.org?format=json",
    ];

    // CORS proxy services for localhost development
    const corsProxies = [
      "https://cors-anywhere.herokuapp.com/",
      "https://api.allorigins.win/raw?url=",
      "https://corsproxy.io/?",
    ];

    let data = null;
    let lastError = null;

    // Try each service
    for (const service of services) {
      const urlsToTry = [service];

      // Add CORS proxy URLs for localhost development
      if (
        typeof window !== "undefined" &&
        window.location?.hostname === "localhost"
      ) {
        urlsToTry.push(
          ...corsProxies.map(
            (proxy) => `${proxy}${encodeURIComponent(service)}`,
          ),
        );
      }

      // Try each URL (original + proxies)
      for (const url of urlsToTry) {
        try {
          const res = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            const serviceData = await res.json();

            // Normalize data from different services
            if (service.includes("ipapi.co")) {
              data = serviceData;
              break;
            } else if (service.includes("ip-api.com")) {
              data = {
                ip: serviceData.query,
                country_code: serviceData.countryCode,
                country_name: serviceData.country,
                region: serviceData.regionName,
                city: serviceData.city,
                timezone: serviceData.timezone,
              };
              break;
            } else if (service.includes("ipify.org")) {
              // ipify only gives IP, need another service for location
              continue;
            }
          }
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      if (data) break;
    }

    // If all services failed, try browser geolocation as last resort
    if (!data && typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 0,
          });
        });

        // Use a reverse geocoding service
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (geoData.address?.country_code) {
          data = {
            ip: null,
            country_code: geoData.address.country_code.toUpperCase(),
            country_name: geoData.address.country,
            region: geoData.address.state || geoData.address.region,
            city: geoData.address.city || geoData.address.town,
            timezone: null,
          };
        }
      } catch (geoError) {
        // Geolocation failed, continue to fallback
      }
    }

    // If all methods failed, return error
    if (!data) {
      throw lastError || new Error("All geolocation services failed");
    }

    // Get country code with fallback
    const country = data.country_code?.toUpperCase() || "US";

    // Get currency info for detected country
    const currencyInfo = countryToCurrency[country] || {
      currency: "USD",
      symbol: "$",
    };

    return {
      ip: data.ip || null,
      country,
      countryName: data.country_name || "United States",
      currency: currencyInfo.currency,
      symbol: currencyInfo.symbol,
      region: data.region || null,
      city: data.city || null,
      timezone: data.timezone || null,
    };
  } catch (error) {
    // Global fallback - always return something usable
    return {
      ip: null,
      country: "US",
      countryName: "United States",
      currency: "USD",
      symbol: "$",
      region: null,
      city: null,
      timezone: null,
      error: true,
      errorMessage: error.message || "Location detection failed",
    };
  }
}
