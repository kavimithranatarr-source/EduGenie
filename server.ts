import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini client utility with recommended User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for safe AI invocation
const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not configured. Please ensure your API key is provided.');
  }
  return ai;
};

// Resilient model invocation that falls back to gemini-3.1-flash-lite if gemini-3.8-flash hits temporary 503 load spikes
async function generateContentWithRetry(params: any) {
  const client = getAiClient();
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await client.models.generateContent({
        ...params,
        model,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      const errStr = typeof err?.message === 'string' ? err.message : JSON.stringify(err);
      const isTransient =
        errStr.includes('503') ||
        errStr.includes('high demand') ||
        errStr.includes('UNAVAILABLE') ||
        errStr.includes('ResourceExhausted');

      if (isTransient) {
        console.warn(`Model ${model} returned transient error: ${errStr}. Trying next candidate model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// 1. Health check & API specification info
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'EduGenie REST API Engine',
    model: 'gemini-3.8-flash',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
    endpoints: [
      { path: '/api/chat', method: 'POST', description: 'Interactive multi-turn academic conversation' },
      { path: '/api/ask', method: 'POST', description: 'Academic question answering with structured steps' },
      { path: '/api/explain', method: 'POST', description: 'Deep concept simplification & analogies' },
      { path: '/api/summarize', method: 'POST', description: 'Smart document and notes summarization' },
      { path: '/api/quiz/generate', method: 'POST', description: 'Automatic MCQ & concept quiz generator' },
      { path: '/api/quiz/evaluate-short-answer', method: 'POST', description: 'AI assessment of student short answer' },
      { path: '/api/learning-path', method: 'POST', description: 'Custom roadmap generation' },
      { path: '/api/flashcards/generate', method: 'POST', description: 'Spaced repetition flashcards creation' },
    ],
  });
});

// 2. Academic Question Answering
app.post('/api/ask', async (req: Request, res: Response) => {
  try {
    const { question, subject = 'General Academic', academicLevel = 'Undergraduate', includeSteps = true } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const client = getAiClient();
    const systemInstruction = `You are EduGenie, an elite academic tutor and professor.
Your role is to provide clear, rigorous, pedagogically sound, and engaging explanations to academic questions.
Subject context: ${subject}.
Academic Level: ${academicLevel}.
Formatting rules:
- Provide an intuitive summary first.
- If problem-solving or calculation is required, break it down into clean numbered steps.
- Provide theoretical background and formulas where applicable (use LaTeX or clean notation like $E = mc^2$).
- Highlight key takeaways, common pitfalls/misconceptions, and a quick self-check question.
- Format using rich Markdown with headers, bold terms, bullet points, and code/math blocks.`;

    const response = await generateContentWithRetry({
      contents: `Question from student: "${question}"\nPlease provide a comprehensive, step-by-step academic answer suitable for a ${academicLevel} student.`,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({
      answer: response.text || 'No answer generated.',
      subject,
      academicLevel,
    });
  } catch (error: any) {
    console.error('Error in /api/ask:', error);
    return res.status(500).json({ error: error.message || 'Failed to answer question' });
  }
});

// 3. Concept Simplification & Topic Explanation
app.post('/api/explain', async (req: Request, res: Response) => {
  try {
    const { topic, mode = 'eli5', targetAudience = 'High School' } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const client = getAiClient();
    const prompt = `Topic to explain: "${topic}"
Mode requested: "${mode}" (e.g. eli5, analogy, first-principles, visual-mental-model, cheat-sheet)
Target Audience: "${targetAudience}"

Provide a structured JSON response explaining this concept thoroughly.
The response must adhere to this JSON format:
{
  "title": string,
  "oneSentenceSummary": string,
  "coreAnalogy": {
    "title": string,
    "story": string,
    "mapping": [{"conceptComponent": string, "analogyComponent": string}]
  },
  "detailedExplanation": string,
  "firstPrinciplesBreakdown": [string],
  "commonMisconceptions": [{"misconception": string, "reality": string}],
  "realWorldApplications": [string],
  "quickCheckQuestion": {
    "question": string,
    "options": [string],
    "correctIndex": number,
    "explanation": string
  },
  "cheatSheetTakeaways": [string]
}`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            oneSentenceSummary: { type: Type.STRING },
            coreAnalogy: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                story: { type: Type.STRING },
                mapping: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      conceptComponent: { type: Type.STRING },
                      analogyComponent: { type: Type.STRING },
                    },
                    required: ['conceptComponent', 'analogyComponent'],
                  },
                },
              },
              required: ['title', 'story', 'mapping'],
            },
            detailedExplanation: { type: Type.STRING },
            firstPrinciplesBreakdown: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            commonMisconceptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  misconception: { type: Type.STRING },
                  reality: { type: Type.STRING },
                },
                required: ['misconception', 'reality'],
              },
            },
            realWorldApplications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            quickCheckQuestion: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctIndex', 'explanation'],
            },
            cheatSheetTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'title',
            'oneSentenceSummary',
            'coreAnalogy',
            'detailedExplanation',
            'firstPrinciplesBreakdown',
            'commonMisconceptions',
            'realWorldApplications',
            'quickCheckQuestion',
            'cheatSheetTakeaways',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/explain:', error);
    return res.status(500).json({ error: error.message || 'Failed to explain concept' });
  }
});

// 4. Smart Summarization & Note Generator
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const { text, format = 'structured', focusArea = 'general' } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required for summarization' });
    }

    const client = getAiClient();
    const prompt = `Analyze and summarize the following study material or academic text.
Format requested: "${format}" (options: structured, bullet-points, exam-cram, flashcards-extract, action-items)
Focus area: "${focusArea}"

Text to summarize:
"""
${text.slice(0, 30000)}
"""

Return a JSON response adhering to this schema:
{
  "title": string,
  "executiveSummary": string,
  "keyTakeaways": [string],
  "coreConcepts": [{"term": string, "definition": string, "significance": string}],
  "formulasOrKeyRules": [string],
  "examTips": [string],
  "actionItems": [string],
  "estimatedReadingTimeMinutes": number
}`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            coreConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  significance: { type: Type.STRING },
                },
                required: ['term', 'definition', 'significance'],
              },
            },
            formulasOrKeyRules: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            examTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            estimatedReadingTimeMinutes: { type: Type.NUMBER },
          },
          required: [
            'title',
            'executiveSummary',
            'keyTakeaways',
            'coreConcepts',
            'formulasOrKeyRules',
            'examTips',
            'actionItems',
            'estimatedReadingTimeMinutes',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/summarize:', error);
    return res.status(500).json({ error: error.message || 'Failed to summarize text' });
  }
});

// 5. Automatic Quiz Generation
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
  try {
    const { topicOrText, count = 5, difficulty = 'medium', questionType = 'mixed' } = req.body;
    if (!topicOrText || typeof topicOrText !== 'string') {
      return res.status(400).json({ error: 'Topic or study text is required' });
    }

    const client = getAiClient();
    const prompt = `Generate a high-yield academic quiz based on:
"${topicOrText.slice(0, 15000)}"

Quiz parameters:
- Question count: ${Math.min(Math.max(count, 1), 10)}
- Difficulty level: ${difficulty} (easy, medium, hard)
- Type focus: ${questionType} (mcq, conceptual, mixed)

Return a strictly valid JSON response adhering to this schema:
{
  "quizTitle": string,
  "description": string,
  "difficulty": string,
  "questions": [
    {
      "id": string,
      "type": "mcq" | "short_answer",
      "question": string,
      "options": [string],
      "correctIndex": number,
      "idealAnswer": string,
      "explanation": string,
      "hint": string,
      "conceptTested": string
    }
  ]
}`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  idealAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  conceptTested: { type: Type.STRING },
                },
                required: ['id', 'type', 'question', 'options', 'correctIndex', 'idealAnswer', 'explanation', 'hint', 'conceptTested'],
              },
            },
          },
          required: ['quizTitle', 'description', 'difficulty', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/quiz/generate:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// 6. AI Evaluation for Short-Answer Quiz Questions
app.post('/api/quiz/evaluate-short-answer', async (req: Request, res: Response) => {
  try {
    const { question, idealAnswer, studentAnswer, conceptTested } = req.body;
    if (!question || !studentAnswer) {
      return res.status(400).json({ error: 'Question and studentAnswer are required' });
    }

    const client = getAiClient();
    const prompt = `Grade the student's answer to this academic question:
Question: "${question}"
Concept Tested: "${conceptTested || 'General'}"
Ideal Answer: "${idealAnswer || ''}"
Student's Answer: "${studentAnswer}"

Evaluate fairly. Return a JSON with:
{
  "score": number (0 to 100),
  "isCorrect": boolean (true if >= 70),
  "feedback": string,
  "strengths": [string],
  "missingPoints": [string],
  "improvementSuggestion": string
}`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementSuggestion: { type: Type.STRING },
          },
          required: ['score', 'isCorrect', 'feedback', 'strengths', 'missingPoints', 'improvementSuggestion'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/quiz/evaluate-short-answer:', error);
    return res.status(500).json({ error: error.message || 'Failed to evaluate answer' });
  }
});

// 7. Personalized Learning Path & Roadmap
app.post('/api/learning-path', async (req: Request, res: Response) => {
  try {
    const { goal, currentLevel = 'beginner', timeframe = '4 weeks', weeklyHours = 5 } = req.body;
    if (!goal || typeof goal !== 'string') {
      return res.status(400).json({ error: 'Learning goal is required' });
    }

    const client = getAiClient();
    const prompt = `Create a structured, step-by-step personalized learning path for:
Goal: "${goal}"
Current Learner Level: "${currentLevel}" (beginner, intermediate, advanced)
Available Timeframe: "${timeframe}"
Commitment: ${weeklyHours} hours per week

Structure the curriculum into sequential milestones/modules.
JSON schema:
{
  "roadmapTitle": string,
  "summary": string,
  "targetProficiency": string,
  "totalEstimatedHours": number,
  "milestones": [
    {
      "id": string,
      "phase": string,
      "title": string,
      "duration": string,
      "objectives": [string],
      "keyTopics": [string],
      "recommendedProjects": [string],
      "selfAssessmentChecklist": [string],
      "checkpointQuestion": string
    }
  ],
  "studyTips": [string]
}`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roadmapTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            targetProficiency: { type: Type.STRING },
            totalEstimatedHours: { type: Type.NUMBER },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  phase: { type: Type.STRING },
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keyTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedProjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  selfAssessmentChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
                  checkpointQuestion: { type: Type.STRING },
                },
                required: ['id', 'phase', 'title', 'duration', 'objectives', 'keyTopics', 'recommendedProjects', 'selfAssessmentChecklist', 'checkpointQuestion'],
              },
            },
            studyTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['roadmapTitle', 'summary', 'targetProficiency', 'totalEstimatedHours', 'milestones', 'studyTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/learning-path:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate learning path' });
  }
});

// 8. Flashcard Deck Generation
app.post('/api/flashcards/generate', async (req: Request, res: Response) => {
  try {
    const { topicOrText, count = 8 } = req.body;
    if (!topicOrText || typeof topicOrText !== 'string') {
      return res.status(400).json({ error: 'Topic or text is required' });
    }

    const client = getAiClient();
    const prompt = `Create an active recall flashcard deck based on:
"${topicOrText.slice(0, 15000)}"
Count: ${Math.min(Math.max(count, 3), 15)} cards.

Return a JSON object:
{
  "deckTitle": string,
  "description": string,
  "category": string,
  "cards": [
    {
      "id": string,
      "front": string,
      "back": string,
      "hint": string,
      "tags": [string]
    }
  ]
}`;

    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['id', 'front', 'back', 'hint', 'tags'],
              },
            },
          },
          required: ['deckTitle', 'description', 'category', 'cards'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/flashcards/generate:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// 9. Interactive Conversational Learning (Chat with academic context)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, academicSubject = 'General', currentTopic = '' } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }

    const client = getAiClient();
    const systemInstruction = `You are EduGenie, a supportive, genius personal academic tutor.
Subject context: ${academicSubject}. Current topic: ${currentTopic || 'General learning'}.
Teaching philosophy:
- Use Socratic guiding questions when appropriate, but always directly answer the student when they are stuck.
- Break hard problems into step-by-step reasoning.
- Use clear markdown, bullet points, and code/math formatting.
- Be encouraging, precise, and academically rigorous.
- Invite follow-up exploration.`;

    // Convert messages into Gemini contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await generateContentWithRetry({
      contents,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    return res.json({
      reply: response.text || 'I could not generate a response. Please try rephrasing.',
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({ error: error.message || 'Failed in chat turn' });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In dev: mount vite.middlewares
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server listening on port ${PORT} (dev: ${!isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
