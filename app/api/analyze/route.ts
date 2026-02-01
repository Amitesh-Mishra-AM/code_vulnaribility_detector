import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json({ error: "Server misconfiguration: API Key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const schema = {
      description: "Vulnerability analysis result",
      type: SchemaType.OBJECT,
      properties: {
        safe: {
          type: SchemaType.BOOLEAN,
          description: "True if code is mostly safe, false if vulnerabilities found",
        },
        summary: {
          type: SchemaType.STRING,
          description: "One sentence summary of findings",
        },
        vulnerabilities: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: { type: SchemaType.STRING, description: "Issue Type (e.g. SQL Injection)" },
              severity: { type: SchemaType.STRING, description: "Severity: Critical, High, Medium, or Low" },
              location: { type: SchemaType.STRING, description: "Line number or code block description" },
              description: { type: SchemaType.STRING, description: "Detailed explanation of the issue" },
              fix: { type: SchemaType.STRING, description: "Corrected code string" },
              explanation: { type: SchemaType.STRING, description: "Why this fix resolves the issue" },
            },
            required: ["type", "severity", "location", "description", "fix", "explanation"],
          },
        },
      },
      required: ["safe", "summary", "vulnerabilities"],
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = `
      You are an expert security researcher. Analyze the following code for security vulnerabilities.
      
      Code Snippet:
      ${code}

      Tasks:
      1. Identify all security vulnerabilities (OWASP Top 10, etc).
      2. For each vulnerability, determine severity (Critical, High, Medium, Low).
      3. Provide a fixed version of the code snippet.
      4. Explain the vulnerability and the fix clearly.
    `;

    try {
      const result = await model.generateContent(prompt);
      // Result is guaranteed to be JSON with the schema structure
      const responseText = result.response.text();

      try {
        const analysis = JSON.parse(responseText);
        return NextResponse.json(analysis);
      } catch (e) {
        console.error("JSON Parse Error", e);
        console.log("Raw Response", responseText);
        // Sometimes text() might still wrap it, usually not with responseSchema, but safety check:
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
      }
    } catch (genError: any) {
      console.error("Gemini Generation Error:", genError);
      return NextResponse.json({
        error: "AI Model Error",
        details: genError.message || "Unknown error"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: "Analysis failed server-side" }, { status: 500 });
  }
}
