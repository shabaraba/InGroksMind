# BeGrok Project Notes

## Technology Stack
- **Frontend**: React, Tailwind CSS
- **Frameworks**:
  - Next.js (original implementation)
  - Hono (migration in progress for Cloudflare Workers)
- **Data Storage**: Cloudflare KV (key-value store)
- **Deployment**: Cloudflare Workers (edge execution)

## Key Features
- Quiz system that simulates AI assistant response styles
- User answer evaluation against AI reference answers
- Dynamic OG image generation for social sharing
- Internationalization (Japanese and English)
- Serverless architecture built for edge deployment

## Project Structure
- Two implementations:
  1. Main Next.js implementation
  2. Hono implementation for Cloudflare Workers
- KV storage used for result persistence (30-day expiration)

## Data Flow
1. User receives random quiz with specific AI style
2. User submits answer
3. System evaluates answer (comparing to Gemini API response)
4. Results stored in KV storage with unique ID
5. Dynamic OG image generated for sharing

## Important Files
- `/hono-app/src/utils/kvStorage.ts` - KV storage implementation
- `/hono-app/src/index.ts` - Hono app entry point
- `/hono-app/src/routes/submit-answer.ts` - Answer submission handler
- `/hono-app/src/result.ts` - Result page rendering

## Result ID Format
`quizId-styleId-score-lang-quizUserId-replyUserId`

## API Endpoints
- `/api/get-gemini-answer` - Get AI reference answer
- `/api/evaluate-answer` - Evaluate user answer
- `/api/save-share` - Save shared results
- `/api/og-image/:id` - Generate OG image for results