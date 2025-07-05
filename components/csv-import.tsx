"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface BudgetItem {
  id: string
  category: string
  amount: number
  type: "income" | "expense"
}

interface CSVImportProps {
  onImport: (data: BudgetItem[]) => void
}

export default function CSVImport({ onImport }: CSVImportProps) {
  const [csvData, setCsvData] = useState<string>("")
  const [previewData, setPreviewData] = useState<BudgetItem[]>([])
  const [isValid, setIsValid] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (csvText: string) => {
    try {
      const lines = csvText.trim().split("\n")
      const data: BudgetItem[] = []

      lines.forEach((line, index) => {
        const [category, amount, type] = line.split(",").map((item) => item.trim())

        if (!category || !amount || !type) {
          throw new Error(`Invalid data on line ${index + 1}`)
        }

        const numAmount = Number.parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) {
          throw new Error(`Invalid amount on line ${index + 1}`)
        }

        if (type !== "income" && type !== "expense") {
          throw new Error(`Invalid type on line ${index + 1}. Must be 'income' or 'expense'`)
        }

        data.push({
          id: `csv-${index}`,
          category,
          amount: numAmount,
          type: type as "income" | "expense",
        })
      })

      setPreviewData(data)
      setIsValid(true)
      return data
    } catch (error) {
      setIsValid(false)
      setPreviewData([])
      toast({
        title: "CSV Parse Error",
        description: error instanceof Error ? error.message : "Invalid CSV format",
        variant: "destructive",
      })
      return []
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setCsvData(text)
      parseCSV(text)
    }
    reader.readAsText(file)
  }

  const handleTextareaChange = (value: string) => {
    setCsvData(value)
    if (value.trim()) {
      parseCSV(value)
    } else {
      setPreviewData([])
      setIsValid(false)
    }
  }

  const handleImport = () => {
    if (isValid && previewData.length > 0) {
      onImport(previewData)
      setCsvData("")
      setPreviewData([])
      setIsValid(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const downloadSample = () => {
    const sampleData = `Salary,5000,income
Freelance,1500,income
Rent,1200,expense
Groceries,400,expense
Utilities,200,expense`

    const blob = new Blob([sampleData], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "sample_budget.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Budget Data
          </CardTitle>
          <CardDescription>Import your budget data from a CSV file or paste CSV text directly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="mt-1"
            />
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-500">or</span>
          </div>

          <div>
            <Label htmlFor="csv-text">Paste CSV Data</Label>
            <textarea
              id="csv-text"
              value={csvData}
              onChange={(e) => handleTextareaChange(e.target.value)}
              placeholder="Category,Amount,Type&#10;Salary,5000,income&#10;Rent,1200,expense"
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={downloadSample} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Download Sample
            </Button>
          </div>
        </CardContent>
      </Card>

      {csvData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Data Preview
            </CardTitle>
            <CardDescription>
              {isValid ? `${previewData.length} items ready to import` : "Please fix the errors in your CSV data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewData.length > 0 && (
              <div className="space-y-4">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Category</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.category}</td>
                          <td className="p-2">${item.amount.toLocaleString()}</td>
                          <td className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                item.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button onClick={handleImport} className="w-full" disabled={!isValid}>
                  Import {previewData.length} Items
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>CSV Format Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Format:</strong> Category,Amount,Type
            </p>
            <p>
              <strong>Example:</strong>
            </p>
            <pre className="bg-gray-100 p-2 rounded text-xs">
              {`Salary,5000,income
Freelance,1500,income
Rent,1200,expense
Groceries,400,expense`}
            </pre>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Each line represents one budget item</li>
              <li>Amount must be a positive number</li>
              <li>Type must be either 'income' or 'expense'</li>
              <li>No headers required</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
