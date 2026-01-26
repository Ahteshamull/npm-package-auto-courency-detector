# currency-detector

Detect user country and currency using IP address.
No API key required. 100% free.

## Install

npm install currency-detector

## Basic Usage

```js
import CurrencyDetector from "currency-detector";

const data = await CurrencyDetector.detect();

console.log(data.country);   // BD
console.log(data.currency);  // BDT
console.log(data.symbol);    // ৳



## Callback Usage

```js
CurrencyDetector.init({
  onDetect: (data) => {
    console.log(data.currency);
  }
});
```

## ⚛️ React Example (USD → BDT)

---
// TODO: Add React example
---
```js
import { useEffect, useState } from "react";
import CurrencyDetector from "currency-detector";

export default function App() {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    async function loadPrice() {
      const result = await CurrencyDetector.convert({
        amount: 10,
        from: "USD",
      });

      setPrice(result);
    }

    loadPrice();
  }, []);

  return (
    <div className="p-10">
      {price ? (
        <h1 className="text-2xl font-bold">
          Price: {price.symbol} {price.converted.toFixed(2)}
        </h1>
      ) : (
        "Loading price..."
      )}
    </div>
  );
}     

```
---

