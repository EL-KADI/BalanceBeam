"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration, registerables } from "chart.js"

Chart.register(...registerables)

interface BudgetItem {
  id: string
  category: string
  amount: number
  type: "income" | "expense"
}

interface BudgetChartProps {
  data: BudgetItem[]
  chartType: "bar" | "pie" | "line"
  colorTheme: string[]
  isAnimated: boolean
}

export default function BudgetChart({ data, chartType, colorTheme, isAnimated }: BudgetChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const incomeData = data.filter((item) => item.type === "income")
    const expenseData = data.filter((item) => item.type === "expense")

    let chartConfig: ChartConfiguration

    if (chartType === "pie") {
      const allData = [...incomeData, ...expenseData]
      chartConfig = {
        type: "pie",
        data: {
          labels: allData.map((item) => item.category),
          datasets: [
            {
              data: allData.map((item) => item.amount),
              backgroundColor: colorTheme.slice(0, allData.length),
              borderWidth: 2,
              borderColor: "#ffffff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            animateRotate: isAnimated,
            animateScale: isAnimated,
            duration: isAnimated ? 1000 : 0,
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                  const percentage = ((context.parsed / total) * 100).toFixed(1)
                  return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`
                },
              },
            },
          },
        },
      }
    } else if (chartType === "bar") {
      chartConfig = {
        type: "bar",
        data: {
          labels: ["Income", "Expenses"],
          datasets: [
            {
              label: "Amount",
              data: [
                incomeData.reduce((sum, item) => sum + item.amount, 0),
                expenseData.reduce((sum, item) => sum + item.amount, 0),
              ],
              backgroundColor: [colorTheme[0], colorTheme[1]],
              borderColor: [colorTheme[0], colorTheme[1]],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: isAnimated ? 1000 : 0,
            easing: "easeInOutQuart",
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => "$" + Number(value).toLocaleString(),
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`,
              },
            },
          },
        },
      }
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      const incomeTotal = incomeData.reduce((sum, item) => sum + item.amount, 0)
      const expenseTotal = expenseData.reduce((sum, item) => sum + item.amount, 0)

      chartConfig = {
        type: "line",
        data: {
          labels: months,
          datasets: [
            {
              label: "Income",
              data: months.map(() => incomeTotal + (Math.random() - 0.5) * incomeTotal * 0.2),
              borderColor: colorTheme[0],
              backgroundColor: colorTheme[0] + "20",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Expenses",
              data: months.map(() => expenseTotal + (Math.random() - 0.5) * expenseTotal * 0.2),
              borderColor: colorTheme[1],
              backgroundColor: colorTheme[1] + "20",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: isAnimated ? 1500 : 0,
            easing: "easeInOutQuart",
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => "$" + Number(value).toLocaleString(),
              },
            },
          },
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`,
              },
            },
          },
        },
      }
    }

    chartInstance.current = new Chart(ctx, chartConfig)

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, chartType, colorTheme, isAnimated])

  return (
    <div className="relative h-64 w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
