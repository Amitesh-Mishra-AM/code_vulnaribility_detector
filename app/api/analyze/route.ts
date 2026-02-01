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
      1. Analyze the code STRICTLY. Do NOT hallucinate vulnerabilities. 
      2. IF THE CODE IS SAFE (or effectively the same as a standard secure implementation), set "safe" to true and "vulnerabilities" to an empty array.
      3. Do NOT flag code as vulnerable just because it's short or missing context, unless there is an explicit insecure pattern (like string concatenation in SQL).
      4. For each ACTUAL vulnerability, provide a fixed version.
      5. CRITICAL: The 'fix' field MUST contain the COMPLETE, formatted code block. Use \\n for newlines and preserve indentation so it renders correctly in a <pre> tag. Do not minify the fix.

      Analysis Strictness:
      - If the code uses parameterized queries, it is SAFE from SQLi.
      - If the code uses standard escaping functions, it is SAFE from XSS.
      - Do not output a 'fix' that is identical to the input or just adds comments.
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
