"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserPreference {
  id: string;
  userId: string;
  timezone: string;
  deliveryHour: number;
  briefLength: string;
  includeGlobal: boolean;
}

interface SettingsFormProps {
  preference: UserPreference;
}

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Australia/Sydney",
];

const briefLengths = [
  { value: "short", label: "Short (~5 min read)" },
  { value: "medium", label: "Medium (~10 min read)" },
  { value: "long", label: "Long (~15 min read)" },
];

export function SettingsForm({ preference }: SettingsFormProps) {
  const [timezone, setTimezone] = useState(preference.timezone);
  const [deliveryHour, setDeliveryHour] = useState(preference.deliveryHour);
  const [briefLength, setBriefLength] = useState(preference.briefLength);
  const [includeGlobal, setIncludeGlobal] = useState(preference.includeGlobal);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone,
          deliveryHour,
          briefLength,
          includeGlobal,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to save settings" });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSaving(false);
    }
  };

  // Calculate preview delivery time
  const getPreviewTime = () => {
    const now = new Date();
    const preview = new Date(now);
    preview.setHours(deliveryHour, 0, 0, 0);

    return preview.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timezone */}
          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Hour */}
          <div>
            <label
              htmlFor="deliveryHour"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Delivery Time
            </label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                id="deliveryHour"
                min="0"
                max="23"
                value={deliveryHour}
                onChange={(e) =>
                  setDeliveryHour(parseInt(e.target.value, 10))
                }
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                (0-23 hours, 24-hour format)
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Preview: Your briefing will be delivered at approximately{" "}
              <span className="font-medium">{getPreviewTime()}</span> in{" "}
              {timezone}
            </p>
          </div>

          {/* Brief Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Brief Length
            </label>
            <div className="space-y-2">
              {briefLengths.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="briefLength"
                    value={option.value}
                    checked={briefLength === option.value}
                    onChange={(e) => setBriefLength(e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Include Global Events */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeGlobal}
                onChange={(e) => setIncludeGlobal(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include global events
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically include holidays, major events, and important
                  dates in your briefings
                </p>
              </div>
            </label>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
                  : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} size="lg">
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
