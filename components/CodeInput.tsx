"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Upload, Play } from "lucide-react"

interface CodeInputProps {
    onAnalyze: (code: string) => void
    isAnalyzing: boolean
}

export function CodeInput({ onAnalyze, isAnalyzing }: CodeInputProps) {
    const [code, setCode] = useState("")

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const content = event.target?.result as string
            setCode(content)
        }
        reader.readAsText(file)
    }

    return (
        <Card className="w-full max-w-4xl mx-auto border-zinc-200 dark:border-zinc-800 shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                    Source Code Analysis
                </CardTitle>
                <CardDescription>
                    Paste your code below or upload a file to detect vulnerabilities.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Textarea
                        placeholder="// Paste your code here..."
                        className="min-h-[300px] font-mono text-sm bg-zinc-50 dark:bg-zinc-950 resize-y p-4"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <div className="absolute top-2 right-2">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".js,.ts,.py,.java,.c,.cpp,.go,.rs,.php,.rb"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 bg-background/50 backdrop-blur"
                            onClick={() => document.getElementById("file-upload")?.click()}
                        >
                            <Upload className="w-4 h-4" />
                            Upload File
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button
                    variant="default"
                    size="lg"
                    onClick={() => onAnalyze(code)}
                    disabled={!code.trim() || isAnalyzing}
                    className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/20"
                >
                    {isAnalyzing ? (
                        <>Analyzing...</>
                    ) : (
                        <>
                            <Play className="w-4 h-4 fill-current" /> Analyze Security
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
