export async function convertPrice(amount, from, to) {
  try {
    // Validate inputs
    if (!amount || isNaN(amount)) {
      return {
        amount: null,
        rate: null,
        error: "Invalid amount",
      };
    }

    if (!from || !to) {
      return {
        amount: null,
        rate: null,
        error: "Missing currency codes",
      };
    }

    // If same currency, return original amount
    if (from.toUpperCase() === to.toUpperCase()) {
      return {
        amount: parseFloat(amount),
        rate: 1,
      };
    }

    const res = await fetch(
      `https://api.exchangerate.host/convert?from=${from.toUpperCase()}&to=${to.toUpperCase()}&amount=${amount}`,
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Conversion failed");
    }

    return {
      amount: data.result,
      rate: data.info?.rate || null,
    };
  } catch (error) {
    return {
      amount: null,
      rate: null,
      error: error.message || "Conversion failed",
    };
  }
}
