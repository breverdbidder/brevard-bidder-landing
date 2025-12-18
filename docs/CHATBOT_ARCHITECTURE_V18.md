# BidDeed.AI V18 Chatbot Architecture

## Overview

The BidDeed.AI V18 "Everest Summit" chatbot is an intelligent foreclosure auction assistant that combines advanced NLP, real-time database integration, and LLM capabilities to deliver context-aware responses.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BidDeed.AI V18 Chatbot                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│  │   Frontend   │    │  NLP Engine  │    │   Smart      │             │
│  │   React UI   │───▶│  (Intent +   │───▶│   Router     │             │
│  │              │    │   Entities)  │    │   (Gemini)   │             │
│  └──────────────┘    └──────────────┘    └──────────────┘             │
│         │                   │                   │                      │
│         │                   ▼                   ▼                      │
│         │           ┌──────────────┐    ┌──────────────┐             │
│         │           │   Database   │    │     LLM      │             │
│         │           │  Connector   │    │   Response   │             │
│         │           │  (Supabase)  │    │  Generator   │             │
│         │           └──────────────┘    └──────────────┘             │
│         │                   │                   │                      │
│         │                   ▼                   ▼                      │
│         │           ┌──────────────────────────────────┐              │
│         └──────────▶│     Unified Response Pipeline     │◀─────────── │
│                     └──────────────────────────────────┘              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. NLP Engine (`NLPEngine` class)

#### Intent Recognition
- **12 Intent Types**: ANALYZE_PROPERTY, BATCH_ANALYSIS, SEARCH_PROPERTIES, CALENDAR_QUERY, GET_RECOMMENDATIONS, MARKET_ANALYSIS, HELP, GREETING, FAREWELL, CHECK_STATUS, LIEN_QUERY, UNKNOWN
- **Pattern Matching**: Regex-based with confidence scoring (0.0-1.0)
- **Fallback**: Unknown intents route to general help

#### Entity Extraction
| Entity Type | Examples | Normalization |
|-------------|----------|---------------|
| address | "123 Main St Melbourne" | Trim, standardize |
| date | "Dec 17", "2025-12-18" | ISO format |
| caseNumber | "Case #250179" | Digits only |
| parcelId | "PID 3021477" | Digits only |
| price | "$50,000", "50k" | Float value |
| city | "Melbourne", "Palm Bay" | Capitalized |
| propertyType | "condo", "single family" | UPPER_SNAKE |
| recommendation | "BID", "SKIP" | UPPER |

#### Sentiment Analysis
```javascript
{
  score: -1 to +1,  // Negative to Positive
  urgency: boolean, // Detected urgency words
  emotion: 'positive' | 'neutral' | 'negative'
}
```

#### Context Management
- Maintains sliding window of 20 messages
- Context used for disambiguation and follow-up queries
- Automatic cleanup of stale context

### 2. Database Connector (`DatabaseConnector` class)

#### Security Features
- **Input Sanitization**: SQL injection prevention
- **Query Parameterization**: All inputs escaped
- **Rate Limiting**: Per-session throttling
- **Access Control**: Anon key with row-level security

#### Caching Strategy
- **TTL**: 5 minutes for frequent queries
- **Cache Key**: `table:query_hash`
- **Invalidation**: Manual clear on data updates

#### Query Translation
```javascript
// Natural Language → Database Query
"Show Dec 18 properties"
↓
{
  table: 'historical_auctions',
  select: '*',
  filters: ['auction_date.eq.2025-12-18'],
  order: 'judgment_amount.desc',
  limit: 50
}
```

#### Supported Tables
| Table | Purpose |
|-------|---------|
| auction_results | Analyzed properties with recommendations |
| historical_auctions | Past and upcoming auction listings |
| lien_records | Recorded liens and encumbrances |
| market_demographics | Census and market data |
| chat_logs | Conversation history |

### 3. LLM Response Generator (`LLMResponseGenerator` class)

#### Smart Router Tiers
| Tier | Model | Use Case |
|------|-------|----------|
| FREE | Gemini 2.5 Flash | Default, 1M context |
| STANDARD | Claude Haiku | Complex queries |
| PREMIUM | Claude Sonnet | Analysis tasks |

#### Response Templates
- Pre-built templates for common intents
- Dynamic data interpolation
- Tone adjustment based on sentiment
- Expertise level adaptation

#### Response Format
```
📊 **[Section Header]**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Subsection 1**
• Data point 1
• Data point 2

**Subsection 2**
[Detailed content with formatting]

💡 [Actionable suggestion or next steps]
```

## API Endpoints

### Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Analyze 202 Ivory Coral Ln #302" }
  ],
  "tier": "FREE",
  "includeData": true
}
```

### Response Format
```json
{
  "success": true,
  "response": "📊 **Property Analysis Complete**...",
  "metadata": {
    "model": "gemini-2.5-flash",
    "provider": "google",
    "tokens": 1234,
    "tier": "FREE",
    "hasDbContext": true,
    "timestamp": "2025-12-18T02:00:00Z"
  }
}
```

### Health Check
```http
GET /api/chat/health
```

## Intent Flow Examples

### Property Analysis
```
User: "Analyze the property at 202 Ivory Coral Lane"
  ↓
Intent: ANALYZE_PROPERTY (confidence: 0.9)
  ↓
Entity: { address: "202 Ivory Coral Lane" }
  ↓
DB Query: auction_results WHERE address ILIKE '%202 Ivory Coral%'
  ↓
LLM: Generate analysis with property data context
  ↓
Response: Formatted property report
```

### Disambiguation Flow
```
User: "Analyze the property"
  ↓
Intent: ANALYZE_PROPERTY (confidence: 0.9)
  ↓
Entity: { address: null } // Missing required entity
  ↓
Disambiguation: "Which property would you like me to analyze?"
  ↓
User: "202 Ivory Coral Ln #302"
  ↓
Continue with extracted address
```

## Error Handling

### Retry Strategy
- 3 retries with exponential backoff
- Fallback to cached responses
- Graceful degradation to templates

### Error Types
| Error | Handler |
|-------|---------|
| DB Connection | Return cached or template |
| LLM Timeout | Retry then fallback |
| Invalid Intent | Route to HELP |
| Rate Limit | Queue with delay |

## Performance Metrics

### Target KPIs
| Metric | Target |
|--------|--------|
| Response Time | < 2 seconds |
| Intent Accuracy | > 90% |
| Cache Hit Rate | > 60% |
| Error Rate | < 1% |

## Security Considerations

### Input Validation
- Max message length: 1000 chars
- SQL keyword filtering
- XSS prevention
- Rate limiting per session

### Data Access
- Row-level security in Supabase
- Anon key for read-only public data
- Service key for write operations
- No PII in chat logs

## Deployment

### Environment Variables
```env
GOOGLE_API_KEY=xxx          # Gemini API
ANTHROPIC_API_KEY=xxx       # Claude API (optional)
SUPABASE_URL=xxx            # Database URL
SUPABASE_ANON_KEY=xxx       # Public read key
SUPABASE_SERVICE_KEY=xxx    # Admin key (backend only)
```

### Cloudflare Pages
- Auto-deploy from GitHub
- Functions in `/functions/api/`
- Edge caching enabled

## Future Enhancements

### V18.1 Roadmap
- [ ] Voice input support
- [ ] Multi-language NLP
- [ ] Proactive notifications
- [ ] Advanced analytics dashboard
- [ ] Integration with calendar apps
- [ ] Mobile push notifications

### V19 Considerations
- Real-time auction streaming
- Collaborative bidding rooms
- AI-powered bid strategy
- Portfolio management

---

© 2025 Everest Capital USA. All Rights Reserved.
Architecture: Claude Opus 4.5 | Solo Founder: Ariel Shapira
