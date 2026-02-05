// ===================================
// AI CONTROLLER
// ===================================
// Handle AI-powered features (Gemini API)
// ===================================

/**
 * Generate product description using Google Gemini AI
 * POST /api/ai/generate-description
 * Body: { title, category, condition, price, location }
 */
export const generateProductDescription = async (req, res) => {
  try {
    const { title, category, condition, price, location } = req.body;

    // Validate required fields
    if (!title || !category || !condition || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, category, condition, price",
      });
    }

    // Check if Gemini API key is configured
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message:
          "AI service is not configured. Please set GEMINI_API_KEY in environment variables.",
      });
    }

    // Create a prompt for Gemini
    const prompt = `You are a helpful assistant for a student marketplace called MKET at Federal University of Technology, Minna (FUTMINNA), Nigeria.

Generate a compelling and detailed product description for the following item:

Product Title: ${title}
Category: ${category}
Condition: ${condition}
Price: ₦${parseInt(price).toLocaleString()}
Location: ${location || "FUTMINNA Campus"}

Requirements:
1. Write in a friendly, professional tone suitable for students
2. Highlight the key features and benefits
3. Mention the condition clearly
4. Keep it concise (3-4 sentences, max 150 words)
5. Make it appealing to FUTMINNA students
6. Include relevant details about the product
7. Use Nigerian English and context
8. Don't use markdown or special formatting
9. Make it sound natural and conversational

Generate the description now:`;

    // Call Gemini API
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Gemini API error:", error);

      return res.status(response.status).json({
        success: false,
        message: "Failed to generate description using AI",
        error: error.error?.message || "Unknown error",
      });
    }

    const data = await response.json();

    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return res.status(500).json({
        success: false,
        message: "Failed to extract description from AI response",
      });
    }

    // Clean up the generated text
    const description = generatedText.trim();

    return res.status(200).json({
      success: true,
      description: description,
      message: "Description generated successfully",
    });
  } catch (error) {
    console.error("Generate description error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate description",
      error: error.message,
    });
  }
};

/**
 * Health check for AI service
 * GET /api/ai/health
 */
export const checkAIHealth = async (req, res) => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    return res.status(200).json({
      success: true,
      configured: !!GEMINI_API_KEY,
      message: GEMINI_API_KEY
        ? "AI service is configured and ready"
        : "AI service is not configured. Set GEMINI_API_KEY in environment variables.",
    });
  } catch (error) {
    console.error("AI health check error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check AI service health",
    });
  }
};
