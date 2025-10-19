import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, Key, RefreshCw } from "lucide-react";

const charSets = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

export const PasswordGenerator = () => {
  const [length, setLength] = useState(12);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState(0);

  const generatePassword = () => {
    let availableChars = "";
    if (includeLowercase) availableChars += charSets.lowercase;
    if (includeUppercase) availableChars += charSets.uppercase;
    if (includeNumbers) availableChars += charSets.numbers;
    if (includeSymbols) availableChars += charSets.symbols;

    if (availableChars === "") {
      alert("Please select at least one character type.");
      return;
    }

    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += availableChars.charAt(Math.floor(Math.random() * availableChars.length));
    }
    setPassword(newPassword);
    calculateStrength(newPassword);
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 20;
    if (/[a-z]/.test(pwd)) score += 15;
    if (/[A-Z]/.test(pwd)) score += 15;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 15;
    if (pwd.length > 16) score += 10;
    if (/(.+?)\1{2,}/.test(pwd)) score -= 20; // Penalty for repeats

    setStrength(Math.min(100, score));
  };

  const getStrengthLabel = () => {
    if (strength < 40) return "Weak";
    if (strength < 90) return "Strong";
    return "Very Strong";
  };

  const getProgressClass = () => {
    let indicatorClass = "";
    if (strength < 40) indicatorClass = "bg-red-500";
    else if (strength < 90) indicatorClass = "bg-yellow-500";
    else indicatorClass = "bg-green-500";
    return `w-full h-3 bg-white/10 rounded-full [&>div]:${indicatorClass} [&>div]:rounded-full`;
  };

  const getBadgeClass = () => {
    if (strength < 40) return "bg-red-100 text-red-800 border-red-200";
    if (strength < 90) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPwd = e.target.value;
    setPassword(newPwd);
    calculateStrength(newPwd);
  };

  return (
    <div className="p-6 max-w-6xl space-y-6 glass rounded-3xl">
      <h2 className="text-3xl font-bold mb-2">Password Generator & Strength Tester</h2>
      <p className="text-muted-foreground">
        Generate secure passwords or test the strength of your own with real-time feedback.
      </p>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Length Slider */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Password Length</Label>
          <div className="flex items-center space-x-4">
            <Slider
              value={[length]}
              onValueChange={(value) => setLength(value[0])}
              min={8}
              max={128}
              step={1}
              className="flex-1 [&>span]:bg-white/10 [&>span]:data-[state=filled]:bg-blue-500 [&>span]:rounded-full [&>span]:data-[state=pressed]:bg-blue-600"
            />
            <span className="text-sm font-medium min-w-[3rem] text-center">{length}</span>
          </div>
        </div>

        {/* Character Types */}
        <div className="space-y-3">
          <Label className="text-sm font-medium block">Include Character Types</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={(checked) => setIncludeLowercase(!!checked)}
              />
              <Label htmlFor="lowercase" className="text-sm">Lowercase Letters</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={(checked) => setIncludeUppercase(!!checked)}
              />
              <Label htmlFor="uppercase" className="text-sm">Uppercase Letters</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={(checked) => setIncludeNumbers(!!checked)}
              />
              <Label htmlFor="numbers" className="text-sm">Numbers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={(checked) => setIncludeSymbols(!!checked)}
              />
              <Label htmlFor="symbols" className="text-sm">Symbols</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button onClick={generatePassword} className="w-full glass" size="lg">
        <RefreshCw className="h-5 w-5 mr-2" />
        Generate Password
      </Button>

      {/* Password Input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Password</Label>
        <div className="relative">
          <Input
            type="text"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Your password will appear here..."
            className="pr-20 font-mono text-lg"
            readOnly={false}
          />
          <Button
            onClick={handleCopy}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            size="sm"
            variant={copied ? "default" : "outline"}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        {copied && <p className="text-sm text-green-600">Copied to clipboard!</p>}
      </div>

      {/* Strength Meter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Password Strength</Label>
        <div className="space-y-1">
          <Progress value={strength} className={getProgressClass()} />
          <div className="flex justify-between text-sm">
            <span>Weak</span>
            <Badge variant="outline" className={`capitalize ${getBadgeClass()}`}>
              {getStrengthLabel()}
            </Badge>
            <span>Very Strong</span>
          </div>
        </div>
      </div>
    </div>
  );
};
