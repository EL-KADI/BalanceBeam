"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { X, Palette } from "lucide-react"

interface CustomizationSidebarProps {
  chartType: "bar" | "pie" | "line"
  colorTheme: string[]
  isAnimated: boolean
  onChartTypeChange: (type: "bar" | "pie" | "line") => void
  onColorThemeChange: (colors: string[]) => void
  onAnimationToggle: (enabled: boolean) => void
  onClose: () => void
}

const colorThemes = [
  { name: "Default", colors: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"] },
  { name: "Ocean", colors: ["#0EA5E9", "#06B6D4", "#14B8A6", "#10B981", "#84CC16"] },
  { name: "Sunset", colors: ["#F97316", "#EF4444", "#EC4899", "#8B5CF6", "#6366F1"] },
  { name: "Forest", colors: ["#16A34A", "#15803D", "#166534", "#14532D", "#052E16"] },
  { name: "Monochrome", colors: ["#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6"] },
]

export default function CustomizationSidebar({
  chartType,
  colorTheme,
  isAnimated,
  onChartTypeChange,
  onColorThemeChange,
  onAnimationToggle,
  onClose,
}: CustomizationSidebarProps) {
  const handleAnimationToggle = (enabled: boolean) => {
    onAnimationToggle(enabled)
    localStorage.setItem("balancebeam-settings", JSON.stringify({ isAnimated: enabled }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-80 bg-white h-full overflow-y-auto shadow-xl">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Customization
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Chart Type</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChartTypeChange("bar")}
                >
                  Bar
                </Button>
                <Button
                  variant={chartType === "pie" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChartTypeChange("pie")}
                >
                  Pie
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChartTypeChange("line")}
                >
                  Line
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Color Themes</Label>
              <div className="space-y-3 mt-2">
                {colorThemes.map((theme) => (
                  <div
                    key={theme.name}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      JSON.stringify(colorTheme) === JSON.stringify(theme.colors)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => onColorThemeChange(theme.colors)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{theme.name}</span>
                      <div className="flex gap-1">
                        {theme.colors.slice(0, 5).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations" className="text-base font-semibold">
                  Animations
                </Label>
                <Switch id="animations" checked={isAnimated} onCheckedChange={handleAnimationToggle} />
              </div>
              <p className="text-sm text-gray-600 mt-1">Enable smooth animations for chart transitions</p>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Accessibility</h3>
              <p className="text-sm text-gray-600">
                All charts include ARIA labels and keyboard navigation support for screen readers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
