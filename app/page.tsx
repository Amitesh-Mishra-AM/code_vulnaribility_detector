"use client"
import { useState } from "react"
import { CodeInput } from "@/components/CodeInput"
import { VulnerabilityReport } from "@/components/VulnerabilityReport"

export default function Home() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [results, setResults] = useState<any>(null)

    const handleAnalyze = async (code: string) => {
        setIsAnalyzing(true)
        setResults(null)
        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            })
            const data = await response.json()
            setResults(data)
        } catch (error) {
            console.error("Analysis failed", error)
            setResults({ error: "Failed to analyze code." })
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-6 mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 pb-2">
                        Vulnerability Detector
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Secure your applications with AI-powered vulnerability detection.
                        <br className="hidden md:block" />
                        Instant analysis, detailed explanations, and automated fixes.
                    </p>
                </div>

                <CodeInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

                {results && (
                    <VulnerabilityReport data={results} />
                )}
            </div>
        </main>
    )
}
