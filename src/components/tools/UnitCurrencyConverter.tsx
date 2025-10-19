import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Scale, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UnitCategory {
  name: string;
  units: string[];
  convert: (value: number, from: string, to: string) => number;
}

const unitCategories: UnitCategory[] = [
  {
    name: "Length",
    units: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
    convert: (value, from, to) => {
      const meters = {
        mm: value / 1000,
        cm: value / 100,
        m: value,
        km: value * 1000,
        in: value * 0.0254,
        ft: value * 0.3048,
        yd: value * 0.9144,
        mi: value * 1609.34,
      }[from];
      return {
        mm: meters * 1000,
        cm: meters * 100,
        m: meters,
        km: meters / 1000,
        in: meters / 0.0254,
        ft: meters / 0.3048,
        yd: meters / 0.9144,
        mi: meters / 1609.34,
      }[to];
    },
  },
  {
    name: "Weight",
    units: ["mg", "g", "kg", "lb", "oz"],
    convert: (value, from, to) => {
      const grams = {
        mg: value / 1000,
        g: value,
        kg: value * 1000,
        lb: value * 453.592,
        oz: value * 28.3495,
      }[from];
      return {
        mg: grams * 1000,
        g: grams,
        kg: grams / 1000,
        lb: grams / 453.592,
        oz: grams / 28.3495,
      }[to];
    },
  },
  {
    name: "Temperature",
    units: ["C", "F", "K"],
    convert: (value, from, to) => {
      let celsius;
      if (from === "C") celsius = value;
      else if (from === "F") celsius = (value - 32) * 5 / 9;
      else if (from === "K") celsius = value - 273.15;
      if (to === "C") return celsius;
      else if (to === "F") return celsius * 9 / 5 + 32;
      else if (to === "K") return celsius + 273.15;
      return value;
    },
  },
  {
    name: "Volume",
    units: ["ml", "l", "gal", "qt", "pt", "cup"],
    convert: (value, from, to) => {
      const liters = {
        ml: value / 1000,
        l: value,
        gal: value * 3.78541,
        qt: value * 0.946353,
        pt: value * 0.473176,
        cup: value * 0.236588,
      }[from];
      return {
        ml: liters * 1000,
        l: liters,
        gal: liters / 3.78541,
        qt: liters / 0.946353,
        pt: liters / 0.473176,
        cup: liters / 0.236588,
      }[to];
    },
  },
];

const currencies = [
  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "BRL", "RUB", "KRW", "MXN", "SGD", "HKD", "NOK", "SEK", "NZD", "TRY", "ZAR",
  "ARS", "CLP", "COP", "EGP", "GHS", "IDR", "ILS", "KES", "MYR", "NGN", "PHP", "PKR", "THB", "UAH", "VND", "VES", "PEN", "CRC", "UYU"
];

const fetchExchangeRates = async (base: string = "USD") => {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
    if (!response.ok) throw new Error("Failed to fetch rates");
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error("Currency API error:", error);
    // Fallback static rates (approximate, for demo) - expanded for all currencies
    return {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 150.5,
      AUD: 1.51,
      CAD: 1.38,
      CHF: 0.88,
      CNY: 7.25,
      INR: 83.5,
      BRL: 5.6,
      RUB: 97.5,
      KRW: 1350,
      MXN: 18.5,
      SGD: 1.35,
      HKD: 7.8,
      NOK: 10.9,
      SEK: 10.6,
      NZD: 1.64,
      TRY: 34.2,
      ZAR: 18.3,
      ARS: 950,
      CLP: 950,
      COP: 4100,
      EGP: 48,
      GHS: 15,
      IDR: 16000,
      ILS: 3.7,
      KES: 130,
      MYR: 4.7,
      NGN: 1600,
      PHP: 58,
      PKR: 278,
      THB: 36,
      UAH: 41,
      VND: 25000,
      VES: 36,
      PEN: 3.8,
      CRC: 510,
      UYU: 40,
    };
  }
};

export const UnitCurrencyConverter = () => {
  const [activeTab, setActiveTab] = useState<"units" | "currency">("units");
  const [selectedCategory, setSelectedCategory] = useState<string>(unitCategories[0].name);
  const [fromUnit, setFromUnit] = useState<string>("");
  const [toUnit, setToUnit] = useState<string>("");
  const [unitValue, setUnitValue] = useState<number>(1);
  const [unitResult, setUnitResult] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [currencyValue, setCurrencyValue] = useState<number>(1);
  const [currencyResult, setCurrencyResult] = useState<number>(0);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const category = unitCategories.find(c => c.name === selectedCategory);
  const units = category?.units || [];

  const convertUnit = () => {
    if (!category || !fromUnit || !toUnit) return;
    const result = category.convert(unitValue, fromUnit, toUnit);
    setUnitResult(result);
  };

  const convertCurrency = async () => {
    if (fromCurrency === toCurrency) {
      setCurrencyResult(currencyValue);
      return;
    }
    setLoading(true);
    try {
      if (Object.keys(rates).length === 0 || rates[fromCurrency] === undefined) {
        const newRates = await fetchExchangeRates(fromCurrency);
        setRates(newRates);
      }
      const rate = rates[toCurrency] / rates[fromCurrency];
      setCurrencyResult(currencyValue * rate);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitChange = (type: "from" | "to", value: string) => {
    if (type === "from") setFromUnit(value);
    else setToUnit(value);
    if (units.length > 0 && value) {
      const other = type === "from" ? toUnit : fromUnit;
      if (!other) {
        const otherIndex = units.indexOf(value) + 1;
        const otherValue = units[otherIndex % units.length];
        if (type === "from") setToUnit(otherValue);
        else setFromUnit(otherValue);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "units" | "currency")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="units">
            <Scale className="w-4 h-4 mr-2" />
            Unit Converter
          </TabsTrigger>
          <TabsTrigger value="currency">
            <DollarSign className="w-4 h-4 mr-2" />
            Currency Converter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="units" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitCategories.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={unitValue}
                    onChange={(e) => setUnitValue(Number(e.target.value) || 0)}
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Select value={fromUnit} onValueChange={(value) => handleUnitChange("from", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Select value={toUnit} onValueChange={(value) => handleUnitChange("to", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={convertUnit} className="w-full">Convert</Button>
              <div className="text-center">
                <p className="text-2xl font-bold">{unitResult.toFixed(4)} {toUnit}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={currencyValue}
                    onChange={(e) => setCurrencyValue(Number(e.target.value) || 0)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>From</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          {curr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          {curr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Button onClick={convertCurrency} disabled={loading} className="w-full">
                    {loading ? <Skeleton className="w-6 h-6 mr-2 rounded" /> : null}
                    Convert Currency
                  </Button>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{currencyResult.toFixed(4)} {toCurrency}</p>
                <p className="text-sm text-muted-foreground">Rates updated via free API or fallback static data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnitCurrencyConverter;
