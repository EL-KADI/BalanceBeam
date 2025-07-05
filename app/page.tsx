"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Star, Upload, Trash2, Edit, BarChart3, PieChart, TrendingUp } from "lucide-react"
import BudgetChart from "@/components/budget-chart"
import CustomizationSidebar from "@/components/customization-sidebar"
import ExportOptions from "@/components/export-options"
import FavoritesList from "@/components/favorites-list"
import CSVImport from "@/components/csv-import"
import { toast } from "@/hooks/use-toast"

interface BudgetItem {
  id: string
  category: string
  amount: number
  type: "income" | "expense"
}

interface BudgetData {
  id: string
  title: string
  items: BudgetItem[]
  savingsGoal: number
  chartType: "bar" | "pie" | "line"
  colorTheme: string[]
  createdAt: string
}

export default function BalanceBeam() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [itemType, setItemType] = useState<"income" | "expense">("income")
  const [savingsGoal, setSavingsGoal] = useState(1000)
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("pie")
  const [colorTheme, setColorTheme] = useState(["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"])
  const [budgetTitle, setBudgetTitle] = useState("My Budget")
  const [favorites, setFavorites] = useState<BudgetData[]>([])
  const [showSidebar, setShowSidebar] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isAnimated, setIsAnimated] = useState(true)

  useEffect(() => {
    const savedFavorites = localStorage.getItem("balancebeam-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

    const savedSettings = localStorage.getItem("balancebeam-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setIsAnimated(settings.isAnimated ?? true)
    }
  }, [])

  const validateInput = (category: string, amount: string) => {
    const newErrors: { [key: string]: string } = {}

    if (!category.trim()) {
      newErrors.category = "Category is required"
    }

    if (!amount.trim()) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid positive number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addBudgetItem = () => {
    if (!validateInput(newCategory, newAmount)) return

    const newItem: BudgetItem = {
      id: Date.now().toString(),
      category: newCategory.trim(),
      amount: Number(newAmount),
      type: itemType,
    }

    setBudgetItems([...budgetItems, newItem])
    setNewCategory("")
    setNewAmount("")
    setErrors({})

    toast({
      title: "Item Added",
      description: `${newItem.category} added to ${itemType}`,
    })
  }

  const removeBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter((item) => item.id !== id))
    toast({
      title: "Item Removed",
      description: "Budget item has been removed",
    })
  }

  const calculateTotals = () => {
    const totalIncome = budgetItems.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0)

    const totalExpenses = budgetItems
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0)

    const netIncome = totalIncome - totalExpenses
    const savingsProgress = Math.min((netIncome / savingsGoal) * 100, 100)

    return { totalIncome, totalExpenses, netIncome, savingsProgress }
  }

  const saveBudgetToFavorites = () => {
    if (budgetItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add some budget items first",
        variant: "destructive",
      })
      return
    }

    const budgetData: BudgetData = {
      id: Date.now().toString(),
      title: budgetTitle,
      items: budgetItems,
      savingsGoal,
      chartType,
      colorTheme,
      createdAt: new Date().toISOString(),
    }

    const updatedFavorites = [...favorites, budgetData]
    setFavorites(updatedFavorites)
    localStorage.setItem("balancebeam-favorites", JSON.stringify(updatedFavorites))

    toast({
      title: "Budget Saved",
      description: `"${budgetTitle}" has been saved to favorites`,
    })
  }

  const loadBudgetFromFavorites = (budget: BudgetData) => {
    setBudgetItems(budget.items)
    setBudgetTitle(budget.title)
    setSavingsGoal(budget.savingsGoal)
    setChartType(budget.chartType)
    setColorTheme(budget.colorTheme)

    toast({
      title: "Budget Loaded",
      description: `"${budget.title}" has been loaded`,
    })
  }

  const removeFavorite = (id: string) => {
    const updatedFavorites = favorites.filter((fav) => fav.id !== id)
    setFavorites(updatedFavorites)
    localStorage.setItem("balancebeam-favorites", JSON.stringify(updatedFavorites))

    toast({
      title: "Favorite Removed",
      description: "Budget has been removed from favorites",
    })
  }

  const handleCSVImport = (data: BudgetItem[]) => {
    setBudgetItems(data)
    toast({
      title: "CSV Imported",
      description: `${data.length} items imported successfully`,
    })
  }

  const { totalIncome, totalExpenses, netIncome, savingsProgress } = calculateTotals()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BalanceBeam</h1>
          <p className="text-lg text-gray-600">Your Personal Financial Planning Platform</p>
        </header>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Budget
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Overview</CardTitle>
                    <CardDescription>Track your income and expenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Total Income</p>
                        <p className="text-2xl font-bold text-green-700">${totalIncome.toLocaleString()}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-700">${totalExpenses.toLocaleString()}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Net Income</p>
                        <p className={`text-2xl font-bold ${netIncome >= 0 ? "text-blue-700" : "text-red-700"}`}>
                          ${netIncome.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Savings Progress</p>
                        <p className="text-2xl font-bold text-purple-700">{savingsProgress.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="budget-title">Budget Title</Label>
                        <Input
                          id="budget-title"
                          value={budgetTitle}
                          onChange={(e) => setBudgetTitle(e.target.value)}
                          placeholder="Enter budget title"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="e.g., Salary, Rent"
                            className={errors.category ? "border-red-500" : ""}
                          />
                          {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                        </div>
                        <div>
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            placeholder="0.00"
                            className={errors.amount ? "border-red-500" : ""}
                          />
                          {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <select
                            id="type"
                            value={itemType}
                            onChange={(e) => setItemType(e.target.value as "income" | "expense")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <Button onClick={addBudgetItem} className="w-full">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="savings-goal">Savings Goal</Label>
                        <Input
                          id="savings-goal"
                          type="number"
                          value={savingsGoal}
                          onChange={(e) => setSavingsGoal(Number(e.target.value))}
                          placeholder="1000"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {budgetItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Budget Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {budgetItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant={item.type === "income" ? "default" : "destructive"}>{item.type}</Badge>
                              <span className="font-medium">{item.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">${item.amount.toLocaleString()}</span>
                              <Button variant="ghost" size="sm" onClick={() => removeBudgetItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Visualization
                      <Button variant="outline" size="sm" onClick={() => setShowSidebar(!showSidebar)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {budgetItems.length > 0 ? (
                      <BudgetChart
                        data={budgetItems}
                        chartType={chartType}
                        colorTheme={colorTheme}
                        isAnimated={isAnimated}
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-500">Add budget items to see visualization</div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className={chartType === "bar" ? "bg-blue-100" : ""}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChartType("pie")}
                    className={chartType === "pie" ? "bg-blue-100" : ""}
                  >
                    <PieChart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChartType("line")}
                    className={chartType === "line" ? "bg-blue-100" : ""}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveBudgetToFavorites} className="flex-1">
                    <Star className="h-4 w-4 mr-2" />
                    Save to Favorites
                  </Button>
                </div>

                <ExportOptions
                  budgetData={{
                    id: Date.now().toString(),
                    title: budgetTitle,
                    items: budgetItems,
                    savingsGoal,
                    chartType,
                    colorTheme,
                    createdAt: new Date().toISOString(),
                  }}
                  totals={{ totalIncome, totalExpenses, netIncome, savingsProgress }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <FavoritesList
              favorites={favorites}
              onLoadBudget={loadBudgetFromFavorites}
              onRemoveFavorite={removeFavorite}
            />
          </TabsContent>

          <TabsContent value="import">
            <CSVImport onImport={handleCSVImport} />
          </TabsContent>
        </Tabs>

        {showSidebar && (
          <CustomizationSidebar
            chartType={chartType}
            colorTheme={colorTheme}
            isAnimated={isAnimated}
            onChartTypeChange={setChartType}
            onColorThemeChange={setColorTheme}
            onAnimationToggle={setIsAnimated}
            onClose={() => setShowSidebar(false)}
          />
        )}
      </div>
    </div>
  )
}
