"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Share2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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

interface ExportOptionsProps {
  budgetData: BudgetData
  totals: {
    totalIncome: number
    totalExpenses: number
    netIncome: number
    savingsProgress: number
  }
}

export default function ExportOptions({ budgetData, totals }: ExportOptionsProps) {
  const exportToPDF = async () => {
    if (budgetData.items.length === 0) {
      toast({
        title: "Error",
        description: "No budget data to export",
        variant: "destructive",
      })
      return
    }

    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      doc.setFontSize(20)
      doc.text(budgetData.title, 20, 30)

      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45)

      doc.setFontSize(14)
      doc.text("Financial Summary", 20, 65)

      doc.setFontSize(11)
      doc.text(`Total Income: $${totals.totalIncome.toLocaleString()}`, 20, 80)
      doc.text(`Total Expenses: $${totals.totalExpenses.toLocaleString()}`, 20, 95)
      doc.text(`Net Income: $${totals.netIncome.toLocaleString()}`, 20, 110)
      doc.text(`Savings Goal: $${budgetData.savingsGoal.toLocaleString()}`, 20, 125)
      doc.text(`Savings Progress: ${totals.savingsProgress.toFixed(1)}%`, 20, 140)

      doc.text("Budget Items", 20, 165)

      let yPosition = 180
      budgetData.items.forEach((item) => {
        doc.text(`${item.category} (${item.type}): $${item.amount.toLocaleString()}`, 20, yPosition)
        yPosition += 15

        if (yPosition > 270) {
          doc.addPage()
          yPosition = 30
        }
      })

      doc.save(`${budgetData.title.replace(/\s+/g, "_")}.pdf`)

      toast({
        title: "PDF Exported",
        description: "Your budget has been saved as PDF",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const exportToJSON = () => {
    if (budgetData.items.length === 0) {
      toast({
        title: "Error",
        description: "No budget data to export",
        variant: "destructive",
      })
      return
    }

    try {
      const dataStr = JSON.stringify({ ...budgetData, totals }, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(dataBlob)
      link.download = `${budgetData.title.replace(/\s+/g, "_")}.json`
      link.click()

      toast({
        title: "JSON Exported",
        description: "Your budget data has been saved as JSON",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export JSON. Please try again.",
        variant: "destructive",
      })
    }
  }

  const shareBudget = () => {
    if (budgetData.items.length === 0) {
      toast({
        title: "Error",
        description: "No budget data to share",
        variant: "destructive",
      })
      return
    }

    try {
      const shareData = {
        title: budgetData.title,
        items: budgetData.items,
        totals,
      }

      const encodedData = btoa(JSON.stringify(shareData))
      const shareUrl = `${window.location.origin}?shared=${encodedData}`

      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link Copied",
            description: "Share link has been copied to clipboard",
          })
        })
        .catch(() => {
          toast({
            title: "Share Failed",
            description: "Failed to copy share link",
            variant: "destructive",
          })
        })
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to generate share link",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={exportToPDF} className="w-full justify-start bg-transparent" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </Button>
        <Button onClick={exportToJSON} className="w-full justify-start bg-transparent" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export as JSON
        </Button>
        <Button onClick={shareBudget} className="w-full justify-start bg-transparent" variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share Budget
        </Button>
      </CardContent>
    </Card>
  )
}
