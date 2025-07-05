"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Trash2, Calendar, TrendingUp } from "lucide-react"

interface BudgetData {
  id: string
  title: string
  items: Array<{
    id: string
    category: string
    amount: number
    type: "income" | "expense"
  }>
  savingsGoal: number
  chartType: "bar" | "pie" | "line"
  colorTheme: string[]
  createdAt: string
}

interface FavoritesListProps {
  favorites: BudgetData[]
  onLoadBudget: (budget: BudgetData) => void
  onRemoveFavorite: (id: string) => void
}

export default function FavoritesList({ favorites, onLoadBudget, onRemoveFavorite }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Favorite Budgets</h3>
          <p className="text-gray-500">Save your budgets to access them quickly later</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((budget) => {
        const totalIncome = budget.items
          .filter((item) => item.type === "income")
          .reduce((sum, item) => sum + item.amount, 0)

        const totalExpenses = budget.items
          .filter((item) => item.type === "expense")
          .reduce((sum, item) => sum + item.amount, 0)

        const netIncome = totalIncome - totalExpenses

        return (
          <Card key={budget.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{budget.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(budget.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFavorite(budget.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Income</p>
                  <p className="font-semibold text-green-600">${totalIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Expenses</p>
                  <p className="font-semibold text-red-600">${totalExpenses.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Income</p>
                  <p className={`font-bold ${netIncome >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    ${netIncome.toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {budget.chartType}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{budget.items.length} items</span>
                <span>•</span>
                <span>Goal: ${budget.savingsGoal.toLocaleString()}</span>
              </div>

              <Button onClick={() => onLoadBudget(budget)} className="w-full" size="sm">
                Load Budget
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
