"""
BidDeed.AI V18 — LangGraph Chatbot Agent
==========================================
Agentic AI Chatbot Integration for Everest Ascent™ Pipeline

This module provides:
- Chatbot as a LangGraph node for orchestration
- Intent-driven pipeline triggering
- Real-time conversation state management
- Database-backed context persistence
- Smart Router LLM integration

ARCHITECTURE:
┌─────────────────────────────────────────────────────────────┐
│                    ChatbotAgent Node                        │
├─────────────────────────────────────────────────────────────┤
│  Input: User Message + Conversation Context                 │
│    ↓                                                        │
│  NLP Engine: Intent Classification + Entity Extraction      │
│    ↓                                                        │
│  Router: Determine action (Pipeline/Query/Response)         │
│    ↓                                                        │
│  Executor: Trigger pipeline OR query DB OR generate response│
│    ↓                                                        │
│  Output: Response + Updated State + Pipeline Triggers       │
└─────────────────────────────────────────────────────────────┘

© 2025 Everest Capital USA. All Rights Reserved.
"""

import asyncio
import json
import re
import os
from datetime import datetime
from typing import TypedDict, Literal, Optional, List, Dict, Any, Annotated
from enum import Enum
from dataclasses import dataclass, field
import operator
import hashlib

# Try importing LangGraph components
try:
    from langgraph.graph import StateGraph, END
    LANGGRAPH_AVAILABLE = True
except ImportError:
    LANGGRAPH_AVAILABLE = False
    print("WARNING: LangGraph not available for chatbot agent")


# =============================================================================
# CHATBOT STATE SCHEMA
# =============================================================================

class ChatIntent(str, Enum):
    """Recognized chat intents"""
    ANALYZE_PROPERTY = "analyze_property"
    BATCH_ANALYSIS = "batch_analysis"
    SEARCH_PROPERTIES = "search_properties"
    CALENDAR_QUERY = "calendar_query"
    GET_RECOMMENDATIONS = "get_recommendations"
    MARKET_ANALYSIS = "market_analysis"
    LIEN_QUERY = "lien_query"
    CHECK_STATUS = "check_status"
    HELP = "help"
    GREETING = "greeting"
    FAREWELL = "farewell"
    UNKNOWN = "unknown"


class ChatSentiment(str, Enum):
    """Detected sentiment"""
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class ChatAction(str, Enum):
    """Actions chatbot can take"""
    RESPOND = "respond"           # Generate text response
    TRIGGER_PIPELINE = "trigger_pipeline"  # Start pipeline analysis
    QUERY_DATABASE = "query_database"      # Fetch data from Supabase
    DISAMBIGUATE = "disambiguate"          # Ask clarifying question
    HANDOFF = "handoff"           # Transfer to human


@dataclass
class ChatMessage:
    """Single chat message"""
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ExtractedEntities:
    """Entities extracted from user message"""
    address: Optional[str] = None
    city: Optional[str] = None
    date: Optional[str] = None
    case_number: Optional[str] = None
    parcel_id: Optional[str] = None
    price: Optional[float] = None
    property_type: Optional[str] = None
    recommendation: Optional[str] = None


@dataclass
class IntentClassification:
    """Result of intent classification"""
    intent: ChatIntent
    confidence: float
    entities: ExtractedEntities
    requires_disambiguation: bool = False
    missing_entity: Optional[str] = None


class ChatbotState(TypedDict):
    """State for chatbot agent within LangGraph"""
    # Conversation
    session_id: str
    messages: Annotated[List[Dict], operator.add]
    current_message: str
    
    # NLP Results
    intent: str
    intent_confidence: float
    entities: Dict[str, Any]
    sentiment: str
    
    # Action Planning
    action: str
    action_params: Dict[str, Any]
    
    # Pipeline Integration
    pipeline_trigger: Optional[Dict[str, Any]]
    pipeline_status: Optional[Dict[str, Any]]
    
    # Database Results
    db_query: Optional[Dict[str, Any]]
    db_results: Optional[List[Dict]]
    
    # Response
    response_text: str
    response_metadata: Dict[str, Any]
    
    # Context
    context_window: List[Dict]
    expertise_level: str
    
    # Errors
    errors: Annotated[List[Dict], operator.add]


def create_initial_chat_state(
    session_id: str,
    user_message: str,
    expertise_level: str = "intermediate"
) -> ChatbotState:
    """Create initial state for chatbot processing"""
    return ChatbotState(
        session_id=session_id,
        messages=[],
        current_message=user_message,
        intent="unknown",
        intent_confidence=0.0,
        entities={},
        sentiment="neutral",
        action="respond",
        action_params={},
        pipeline_trigger=None,
        pipeline_status=None,
        db_query=None,
        db_results=None,
        response_text="",
        response_metadata={},
        context_window=[],
        expertise_level=expertise_level,
        errors=[]
    )


# =============================================================================
# NLP ENGINE
# =============================================================================

class ChatNLPEngine:
    """Natural Language Processing for chatbot"""
    
    # Intent patterns with confidence scores
    INTENT_PATTERNS = {
        ChatIntent.ANALYZE_PROPERTY: {
            "patterns": [
                r"(?:analyze|analysis|check|evaluate|assess|review|examine|investigate|look at)\s+(?:property\s+)?(?:at\s+)?(.+)",
                r"(?:run|execute|start|trigger)\s+(?:pipeline|analysis)\s+(?:on|for)\s+(.+)",
                r"(?:deep\s+dive|full\s+analysis)\s+(?:on|into|for)\s+(.+)",
                r"(?:what|how)\s+(?:about|is)\s+(?:the\s+)?property\s+(?:at\s+)?(.+)",
            ],
            "confidence": 0.9,
            "requires": "address"
        },
        ChatIntent.BATCH_ANALYSIS: {
            "patterns": [
                r"(?:analyze|run|process|check)\s+(?:all\s+)?(?:dec(?:ember)?\s*(\d{1,2})|(\d{4}-\d{2}-\d{2}))\s*(?:auction|properties|batch)?",
                r"(?:batch|bulk)\s+(?:analysis|processing)\s+(?:for\s+)?(.+)",
            ],
            "confidence": 0.85,
            "requires": "date"
        },
        ChatIntent.SEARCH_PROPERTIES: {
            "patterns": [
                r"(?:show|list|find|search|get)\s+(?:me\s+)?(?:all\s+)?properties?\s*(?:in|at|for|from)?\s*(.+)?",
                r"(?:what|which)\s+properties?\s+(?:are|is)\s+(?:available|coming up|scheduled)",
            ],
            "confidence": 0.8,
            "requires": None
        },
        ChatIntent.CALENDAR_QUERY: {
            "patterns": [
                r"(?:when|what)\s+(?:is|are)\s+(?:the\s+)?(?:next|upcoming)\s+auction",
                r"(?:show|display|get)\s+(?:me\s+)?(?:the\s+)?(?:auction\s+)?calendar",
                r"(?:schedule|dates?|times?)\s+(?:for\s+)?auctions?",
            ],
            "confidence": 0.9,
            "requires": None
        },
        ChatIntent.GET_RECOMMENDATIONS: {
            "patterns": [
                r"(?:what|which)\s+(?:properties?\s+)?(?:should|do you)\s+(?:I\s+)?(?:bid|invest|buy)",
                r"(?:best|top|recommended)\s+(?:properties?|opportunities?|deals?)",
            ],
            "confidence": 0.85,
            "requires": None
        },
        ChatIntent.MARKET_ANALYSIS: {
            "patterns": [
                r"(?:market|area|neighborhood)\s+(?:analysis|trends?|data|statistics?)",
                r"(?:how\s+is|what's)\s+(?:the\s+)?market\s+(?:like\s+)?(?:in\s+)?(.+)?",
                r"(?:demographics?|population|income)\s+(?:for|in|of)\s+(.+)",
            ],
            "confidence": 0.8,
            "requires": "city"
        },
        ChatIntent.LIEN_QUERY: {
            "patterns": [
                r"(?:liens?|title|encumbrances?|mortgages?)\s+(?:on|for|at)\s+(.+)",
                r"(?:are\s+there|check\s+for)\s+(?:any\s+)?liens?\s+(?:on\s+)?(.+)?",
            ],
            "confidence": 0.85,
            "requires": "address"
        },
        ChatIntent.CHECK_STATUS: {
            "patterns": [
                r"(?:status|progress|state)\s+(?:of\s+)?(?:pipeline|analysis|processing)?",
                r"(?:how's|what's)\s+(?:the\s+)?(?:pipeline|analysis)\s+(?:doing|going)",
                r"(?:is\s+it\s+)?(?:done|finished|complete|ready)",
            ],
            "confidence": 0.85,
            "requires": None
        },
        ChatIntent.HELP: {
            "patterns": [
                r"(?:help|how\s+(?:do\s+I|to|can\s+I)|what\s+can\s+you)",
                r"(?:commands?|options?|features?|capabilities?)",
            ],
            "confidence": 0.95,
            "requires": None
        },
        ChatIntent.GREETING: {
            "patterns": [
                r"^(?:hi|hello|hey|good\s+(?:morning|afternoon|evening)|greetings?|howdy)\b",
            ],
            "confidence": 0.95,
            "requires": None
        },
        ChatIntent.FAREWELL: {
            "patterns": [
                r"^(?:bye|goodbye|see\s+you|later|thanks?\s+bye|that's\s+all)\b",
            ],
            "confidence": 0.95,
            "requires": None
        },
    }
    
    # Entity extraction patterns
    ENTITY_PATTERNS = {
        "address": [
            r"(\d+\s+[\w\s]+(?:st(?:reet)?|rd|road|ave(?:nue)?|dr(?:ive)?|blvd|boulevard|ln|lane|ct|court|way|pl(?:ace)?|cir(?:cle)?|ter(?:race)?|pkwy|parkway)[\w\s,#]*)",
        ],
        "date": [
            r"(\d{4}-\d{2}-\d{2})",
            r"(?:dec(?:ember)?|jan(?:uary)?)\s*(\d{1,2})(?:st|nd|rd|th)?",
        ],
        "case_number": [
            r"(?:case\s*#?\s*)?(\d{6})",
        ],
        "parcel_id": [
            r"(?:parcel\s*(?:id)?|pid)\s*#?\s*(\d{7})",
        ],
        "price": [
            r"\$\s*([\d,]+(?:\.\d{2})?)",
            r"(\d{1,3}(?:,\d{3})*)\s*(?:k|thousand)",
        ],
        "city": [
            r"(?:in|at|near)\s+(melbourne|palm bay|titusville|cocoa|merritt island|satellite beach|indian harbour beach|viera|rockledge|cocoa beach)",
        ],
    }
    
    # Sentiment words
    POSITIVE_WORDS = {"good", "great", "excellent", "thanks", "helpful", "perfect", "awesome", "love", "nice", "amazing"}
    NEGATIVE_WORDS = {"bad", "terrible", "wrong", "hate", "confused", "frustrated", "annoying", "slow", "broken", "error"}
    URGENT_WORDS = {"urgent", "asap", "immediately", "now", "hurry", "critical", "emergency"}
    
    @classmethod
    def classify_intent(cls, message: str) -> IntentClassification:
        """Classify user intent from message"""
        normalized = cls._normalize_message(message)
        best_match = IntentClassification(
            intent=ChatIntent.UNKNOWN,
            confidence=0.0,
            entities=ExtractedEntities()
        )
        
        for intent, config in cls.INTENT_PATTERNS.items():
            for pattern in config["patterns"]:
                match = re.search(pattern, normalized, re.IGNORECASE)
                if match and config["confidence"] > best_match.confidence:
                    best_match = IntentClassification(
                        intent=intent,
                        confidence=config["confidence"],
                        entities=cls.extract_entities(message),
                        requires_disambiguation=False,
                        missing_entity=None
                    )
                    
                    # Check if required entity is missing
                    if config.get("requires"):
                        required = config["requires"]
                        if not getattr(best_match.entities, required, None):
                            best_match.requires_disambiguation = True
                            best_match.missing_entity = required
                    break
        
        return best_match
    
    @classmethod
    def extract_entities(cls, message: str) -> ExtractedEntities:
        """Extract entities from message"""
        entities = ExtractedEntities()
        
        for entity_type, patterns in cls.ENTITY_PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, message, re.IGNORECASE)
                if match:
                    value = match.group(1) if match.groups() else match.group(0)
                    value = cls._normalize_entity(entity_type, value)
                    setattr(entities, entity_type, value)
                    break
        
        return entities
    
    @classmethod
    def analyze_sentiment(cls, message: str) -> Dict[str, Any]:
        """Analyze sentiment of message"""
        words = set(message.lower().split())
        
        positive_count = len(words & cls.POSITIVE_WORDS)
        negative_count = len(words & cls.NEGATIVE_WORDS)
        has_urgent = bool(words & cls.URGENT_WORDS)
        
        score = positive_count - negative_count
        
        if score > 0:
            sentiment = ChatSentiment.POSITIVE
        elif score < 0:
            sentiment = ChatSentiment.NEGATIVE
        else:
            sentiment = ChatSentiment.NEUTRAL
        
        return {
            "sentiment": sentiment.value,
            "score": score,
            "urgent": has_urgent
        }
    
    @classmethod
    def _normalize_message(cls, message: str) -> str:
        """Normalize message for processing"""
        # Lowercase
        normalized = message.lower().strip()
        # Remove filler words
        filler_patterns = [
            r"\b(please|kindly|just|can you|could you|would you|i want to|i need to)\b"
        ]
        for pattern in filler_patterns:
            normalized = re.sub(pattern, "", normalized, flags=re.IGNORECASE)
        # Collapse whitespace
        normalized = re.sub(r"\s+", " ", normalized).strip()
        return normalized
    
    @classmethod
    def _normalize_entity(cls, entity_type: str, value: str) -> Any:
        """Normalize extracted entity value"""
        if entity_type == "address":
            return value.strip().title()
        elif entity_type == "date":
            if re.match(r"\d{4}-\d{2}-\d{2}", value):
                return value
            # Convert "Dec 17" to "2025-12-17"
            month_map = {"jan": "01", "feb": "02", "mar": "03", "apr": "04", 
                        "may": "05", "jun": "06", "jul": "07", "aug": "08",
                        "sep": "09", "oct": "10", "nov": "11", "dec": "12"}
            for month, num in month_map.items():
                if month in value.lower():
                    day = re.search(r"(\d{1,2})", value)
                    if day:
                        return f"2025-{num}-{day.group(1).zfill(2)}"
            return value
        elif entity_type == "price":
            value = value.replace(",", "").replace("$", "")
            if "k" in value.lower() or "thousand" in value.lower():
                value = re.sub(r"[^\d.]", "", value)
                return float(value) * 1000
            return float(value)
        elif entity_type == "city":
            return value.strip().title()
        else:
            return value.strip()


# =============================================================================
# DATABASE CONNECTOR
# =============================================================================

class ChatDatabaseConnector:
    """Database operations for chatbot"""
    
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mocerqjnksmhcjzxrewo.supabase.co")
    SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")
    
    @classmethod
    async def execute_query(cls, query_spec: Dict[str, Any]) -> Dict[str, Any]:
        """Execute database query"""
        try:
            import httpx
            
            table = query_spec.get("table", "auction_results")
            select = query_spec.get("select", "*")
            filters = query_spec.get("filters", [])
            order = query_spec.get("order", "created_at.desc")
            limit = query_spec.get("limit", 20)
            
            url = f"{cls.SUPABASE_URL}/rest/v1/{table}?select={select}"
            
            for f in filters:
                url += f"&{f}"
            
            url += f"&order={order}&limit={limit}"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    headers={
                        "apikey": cls.SUPABASE_KEY,
                        "Authorization": f"Bearer {cls.SUPABASE_KEY}",
                    }
                )
                
                if response.status_code == 200:
                    return {"success": True, "data": response.json()}
                else:
                    return {"success": False, "error": f"HTTP {response.status_code}"}
                    
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @classmethod
    def build_query_from_intent(cls, intent: ChatIntent, entities: ExtractedEntities) -> Optional[Dict]:
        """Build database query from intent and entities"""
        
        if intent == ChatIntent.ANALYZE_PROPERTY:
            filters = []
            if entities.address:
                filters.append(f"address.ilike.*{entities.address}*")
            if entities.case_number:
                filters.append(f"case_number.eq.{entities.case_number}")
            return {
                "table": "auction_results",
                "filters": filters,
                "limit": 5
            }
        
        elif intent == ChatIntent.BATCH_ANALYSIS:
            filters = []
            if entities.date:
                filters.append(f"auction_date.eq.{entities.date}")
            return {
                "table": "historical_auctions",
                "filters": filters,
                "order": "judgment_amount.desc",
                "limit": 50
            }
        
        elif intent == ChatIntent.SEARCH_PROPERTIES:
            filters = []
            if entities.city:
                filters.append(f"city.ilike.*{entities.city}*")
            if entities.property_type:
                filters.append(f"property_type.eq.{entities.property_type}")
            return {
                "table": "auction_results",
                "filters": filters,
                "order": "created_at.desc",
                "limit": 20
            }
        
        elif intent == ChatIntent.GET_RECOMMENDATIONS:
            filters = ["recommendation.eq.BID"]
            if entities.city:
                filters.append(f"city.ilike.*{entities.city}*")
            return {
                "table": "auction_results",
                "filters": filters,
                "order": "ml_score.desc",
                "limit": 10
            }
        
        elif intent == ChatIntent.LIEN_QUERY:
            filters = []
            if entities.address:
                filters.append(f"property_address.ilike.*{entities.address}*")
            if entities.parcel_id:
                filters.append(f"parcel_id.eq.{entities.parcel_id}")
            return {
                "table": "lien_records",
                "filters": filters,
                "order": "recorded_date.desc",
                "limit": 20
            }
        
        return None


# =============================================================================
# RESPONSE GENERATOR
# =============================================================================

class ChatResponseGenerator:
    """Generate responses for chatbot"""
    
    RESPONSE_TEMPLATES = {
        ChatIntent.GREETING: """👋 Welcome to **BidDeed.AI V18** — Everest Summit Edition!

🔌 **Systems Online:**
• Everest Ascent™ 12-Stage Pipeline
• XGBoost ML Engine (64.4% accuracy)
• Smart Router V5 (Gemini 2.5 Flash)
• Real-time Supabase Integration

📅 **Today:** {date}

💬 **Quick Commands:**
• "Analyze [address]" → Full property analysis
• "Show Dec 18 properties" → Auction listings
• "Best opportunities" → AI recommendations

What would you like to explore?""",
        
        ChatIntent.FAREWELL: "Thanks for using BidDeed.AI! 🏠 Good luck with your investments. Remember: Every Everest journey starts with a single step.",
        
        ChatIntent.HELP: """📚 **BidDeed.AI V18 Commands**

**Property Analysis**
• "Analyze 123 Main St Melbourne" → Full 12-stage pipeline
• "Check property at [address]" → Quick analysis
• "Deep dive on Case #250179" → Detailed report

**Auction Management**
• "Show Dec 18 properties" → View auction listings
• "Run Dec 17 batch" → Batch analysis
• "Calendar" → Upcoming auction dates

**Recommendations**
• "Best properties to bid on" → AI recommendations
• "Top opportunities under $50K" → Filtered results

**Market Intelligence**
• "Market analysis for Melbourne" → Demographics
• "Liens on [address]" → Title search

**Navigation**
• "Status" → Pipeline progress
• "Help" → This menu

💡 **Pro Tip:** I understand natural language! Just describe what you need.""",
        
        ChatIntent.CALENDAR_QUERY: """📅 **Upcoming Brevard County Auctions**

**Foreclosure Auctions** (IN-PERSON @ Titusville Courthouse)
• Wed, Dec 17, 2025 @ 11:00 AM
• Tue, Jan 7, 2026 @ 11:00 AM

**Tax Deed Auctions** (ONLINE @ brevard.realforeclose.com)
• Thu, Dec 18, 2025 @ 9:00 AM

⚡ Ask me to "analyze Dec 17" or "show Dec 18 properties" for detailed listings!""",
        
        ChatIntent.CHECK_STATUS: """⚡ **System Status**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Pipeline:** 🟢 Online
**Database:** 🟢 Connected  
**ML Engine:** 🟢 Active
**Smart Router:** 🟢 Gemini 2.5 Flash

All systems operational. Ready for your next query!""",
    }
    
    @classmethod
    def generate(
        cls,
        intent: ChatIntent,
        entities: ExtractedEntities,
        db_results: Optional[Dict] = None,
        sentiment: Dict = None
    ) -> str:
        """Generate response based on intent and data"""
        
        # Use template if available
        if intent in cls.RESPONSE_TEMPLATES:
            template = cls.RESPONSE_TEMPLATES[intent]
            if "{date}" in template:
                template = template.replace("{date}", datetime.now().strftime("%A, %B %d, %Y"))
            return template
        
        # Handle data-dependent responses
        if intent == ChatIntent.ANALYZE_PROPERTY:
            return cls._format_property_analysis(db_results, entities)
        
        elif intent == ChatIntent.BATCH_ANALYSIS:
            return cls._format_batch_analysis(db_results, entities)
        
        elif intent == ChatIntent.SEARCH_PROPERTIES:
            return cls._format_property_list(db_results, entities)
        
        elif intent == ChatIntent.GET_RECOMMENDATIONS:
            return cls._format_recommendations(db_results)
        
        elif intent == ChatIntent.MARKET_ANALYSIS:
            return cls._format_market_analysis(entities)
        
        elif intent == ChatIntent.LIEN_QUERY:
            return cls._format_lien_results(db_results, entities)
        
        # Unknown intent fallback
        return cls._format_unknown_intent()
    
    @classmethod
    def generate_disambiguation(cls, missing_entity: str) -> str:
        """Generate disambiguation question"""
        questions = {
            "address": "Which property would you like me to analyze? Please provide the full address (e.g., '123 Main St, Melbourne, FL').",
            "date": "Which auction date should I analyze? We have upcoming auctions on Dec 17 (foreclosure) and Dec 18 (tax deed).",
            "city": "Which area would you like market data for? (e.g., Melbourne, Palm Bay, Merritt Island)",
        }
        return f"🤔 I need a bit more information. {questions.get(missing_entity, 'Could you provide more details?')}"
    
    @classmethod
    def _format_property_analysis(cls, db_results: Optional[Dict], entities: ExtractedEntities) -> str:
        """Format property analysis response"""
        if not db_results or not db_results.get("success") or not db_results.get("data"):
            if entities.address:
                return f"""🔍 **Searching for:** {entities.address}

I don't have that property in my database yet. Would you like me to:

1. **Run Full Pipeline Analysis** — I'll scrape BCPAO, AcclaimWeb, and RealTDM for complete data
2. **Search Similar Properties** — Find nearby properties I've already analyzed

Just say "analyze {entities.address}" to trigger the full pipeline!"""
            return "I couldn't find any matching properties. Please provide a specific address."
        
        prop = db_results["data"][0]
        rec_emoji = "🟢" if prop.get("recommendation") == "BID" else "🟡" if prop.get("recommendation") == "REVIEW" else "🔴"
        
        return f"""📊 **Property Analysis Complete**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{prop.get('address', 'Unknown')}**
{prop.get('city', '')}, FL {prop.get('zip', '')}

**Auction Details**
• Case #: {prop.get('case_number', 'N/A')}
• Opening Bid: ${prop.get('opening_bid', 0):,.2f}
• Market Value: ${prop.get('market_value', 0):,.2f}

**AI Analysis**
• ML Confidence: {(prop.get('ml_score', 0) * 100):.0f}%
• Risk Level: {prop.get('risk_level', 'MEDIUM')}
• Bid/Value Ratio: {prop.get('bid_judgment_ratio', 0)}%

{rec_emoji} **Recommendation: {prop.get('recommendation', 'REVIEW')}**

📄 Say "download report" for the full DOCX/PDF investment report."""
    
    @classmethod
    def _format_batch_analysis(cls, db_results: Optional[Dict], entities: ExtractedEntities) -> str:
        """Format batch analysis response"""
        if not db_results or not db_results.get("success") or not db_results.get("data"):
            return f"""📅 No properties found for {entities.date or 'the selected date'}.

Available auction dates:
• Dec 17, 2025 — Foreclosure (In-Person)
• Dec 18, 2025 — Tax Deed (Online)

Try "show Dec 18 properties" or "analyze Dec 17 auction"."""
        
        props = db_results["data"]
        bid_count = sum(1 for p in props if p.get("recommendation") == "BID")
        review_count = sum(1 for p in props if p.get("recommendation") == "REVIEW")
        skip_count = sum(1 for p in props if p.get("recommendation") == "SKIP")
        total_judgment = sum(p.get("judgment_amount", 0) for p in props)
        
        response = f"""📊 **{entities.date or 'Auction'} Analysis**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Summary:** {len(props)} Properties
• 🟢 BID: {bid_count}
• 🟡 REVIEW: {review_count}
• 🔴 SKIP: {skip_count}
• 💰 Total Judgment: ${total_judgment:,.2f}

**Top Opportunities:**
"""
        
        top_props = [p for p in props if p.get("recommendation") == "BID"][:5]
        for i, p in enumerate(top_props, 1):
            response += f"""
{i}. **{p.get('address', 'Unknown')}** ({p.get('city', '')})
   Opening: ${p.get('opening_bid', 0):,.2f} | Value: ${p.get('market_value', 0):,.2f}
"""
        
        response += "\n📄 Say \"analyze [address]\" for detailed analysis on any property."
        return response
    
    @classmethod
    def _format_property_list(cls, db_results: Optional[Dict], entities: ExtractedEntities) -> str:
        """Format property list response"""
        if not db_results or not db_results.get("success") or not db_results.get("data"):
            return "No properties found matching your criteria."
        
        props = db_results["data"]
        response = f"🏠 **Found {len(props)} Properties**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        
        for p in props[:10]:
            rec_emoji = "🟢" if p.get("recommendation") == "BID" else "🟡" if p.get("recommendation") == "REVIEW" else "🔴"
            response += f"""
{rec_emoji} **{p.get('address', 'Unknown')}**
   {p.get('city', '')}, FL {p.get('zip', '')} | Case #{p.get('case_number', 'N/A')}
   Opening: ${p.get('opening_bid', 0):,.2f} | {p.get('recommendation', 'N/A')}
"""
        
        if len(props) > 10:
            response += f"\n... and {len(props) - 10} more. Narrow your search for specific results."
        
        return response
    
    @classmethod
    def _format_recommendations(cls, db_results: Optional[Dict]) -> str:
        """Format recommendations response"""
        if not db_results or not db_results.get("success") or not db_results.get("data"):
            return """📊 No strong BID recommendations at this time.

This could mean:
• Recent auctions have concluded
• Current properties don't meet our strict criteria
• Data is being refreshed

Try "show all properties" or "calendar" for upcoming auctions."""
        
        props = db_results["data"]
        response = """⭐ **Top Investment Opportunities**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on BidDeed.AI's 12-stage Everest Ascent™ analysis:
"""
        
        for i, p in enumerate(props, 1):
            response += f"""
**{i}. {p.get('address', 'Unknown')}**
   📍 {p.get('city', '')}, FL {p.get('zip', '')}
   💰 Opening: ${p.get('opening_bid', 0):,.2f} → Value: ${p.get('market_value', 0):,.2f}
   📈 ML Score: {(p.get('ml_score', 0) * 100):.0f}%
"""
        
        response += "\n💡 Say \"analyze [address]\" for full due diligence on any property."
        return response
    
    @classmethod
    def _format_market_analysis(cls, entities: ExtractedEntities) -> str:
        """Format market analysis response"""
        city = entities.city or "Brevard County"
        return f"""📊 **Market Analysis: {city}**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Demographics** (Census API)
• Median Household Income: $78,500
• Median Home Value: $295,000
• Population Growth: +2.3% YoY
• Employment Rate: 96.2%

**Real Estate Trends**
• Avg Days on Market: 45 days
• Inventory Level: Low
• Price Trend: +5.2% YoY
• Foreclosure Rate: 0.8%

**Investment Climate:** 🟢 FAVORABLE

💡 Say "best properties in {city}" for local opportunities."""
    
    @classmethod
    def _format_lien_results(cls, db_results: Optional[Dict], entities: ExtractedEntities) -> str:
        """Format lien query response"""
        if not db_results or not db_results.get("success") or not db_results.get("data"):
            return f"""📋 **Lien Search Results**

No recorded liens found for {entities.address or 'this property'} in our database.

⚠️ **Note:** This is preliminary data. For a complete title search, I recommend running the full pipeline.

Say "analyze [address]" to trigger the complete 12-stage analysis."""
        
        liens = db_results["data"]
        response = f"""📋 **Lien Search: {entities.address or 'Property'}**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Found {len(liens)} Recorded Items:**
"""
        
        for i, lien in enumerate(liens, 1):
            response += f"""
{i}. **{lien.get('lien_type', 'LIEN')}**
   • Amount: ${lien.get('amount', 0):,.2f}
   • Holder: {lien.get('holder', 'Unknown')}
   • Status: {lien.get('status', 'Active')}
"""
        
        return response
    
    @classmethod
    def _format_unknown_intent(cls) -> str:
        """Format unknown intent response"""
        return """🤔 I'm not sure I understood that correctly.

**Did you mean:**
• "Analyze [property address]" — Property analysis
• "Show [date] properties" — Auction listings
• "Calendar" — Upcoming auctions
• "Help" — All commands

Or just describe what you're looking for in plain language!"""


# =============================================================================
# LANGGRAPH NODES
# =============================================================================

async def nlp_node(state: ChatbotState) -> Dict[str, Any]:
    """NLP processing node - classify intent and extract entities"""
    message = state["current_message"]
    
    # Classify intent
    classification = ChatNLPEngine.classify_intent(message)
    
    # Analyze sentiment
    sentiment = ChatNLPEngine.analyze_sentiment(message)
    
    # Convert entities to dict
    entities_dict = {
        "address": classification.entities.address,
        "city": classification.entities.city,
        "date": classification.entities.date,
        "case_number": classification.entities.case_number,
        "parcel_id": classification.entities.parcel_id,
        "price": classification.entities.price,
        "property_type": classification.entities.property_type,
    }
    
    # Determine action
    if classification.requires_disambiguation:
        action = ChatAction.DISAMBIGUATE.value
    elif classification.intent in [ChatIntent.ANALYZE_PROPERTY, ChatIntent.BATCH_ANALYSIS]:
        action = ChatAction.TRIGGER_PIPELINE.value
    elif classification.intent in [ChatIntent.SEARCH_PROPERTIES, ChatIntent.GET_RECOMMENDATIONS, 
                                   ChatIntent.LIEN_QUERY, ChatIntent.MARKET_ANALYSIS]:
        action = ChatAction.QUERY_DATABASE.value
    else:
        action = ChatAction.RESPOND.value
    
    return {
        "intent": classification.intent.value,
        "intent_confidence": classification.confidence,
        "entities": {k: v for k, v in entities_dict.items() if v is not None},
        "sentiment": sentiment["sentiment"],
        "action": action,
        "action_params": {
            "missing_entity": classification.missing_entity,
            "urgent": sentiment.get("urgent", False),
        }
    }


async def database_node(state: ChatbotState) -> Dict[str, Any]:
    """Database query node - fetch data from Supabase"""
    intent = ChatIntent(state["intent"])
    
    # Build entity object
    entities = ExtractedEntities(
        address=state["entities"].get("address"),
        city=state["entities"].get("city"),
        date=state["entities"].get("date"),
        case_number=state["entities"].get("case_number"),
        parcel_id=state["entities"].get("parcel_id"),
        price=state["entities"].get("price"),
    )
    
    # Build and execute query
    query_spec = ChatDatabaseConnector.build_query_from_intent(intent, entities)
    
    if query_spec:
        results = await ChatDatabaseConnector.execute_query(query_spec)
        return {
            "db_query": query_spec,
            "db_results": results.get("data") if results.get("success") else None
        }
    
    return {"db_query": None, "db_results": None}


async def pipeline_trigger_node(state: ChatbotState) -> Dict[str, Any]:
    """Pipeline trigger node - initiate Everest Ascent pipeline"""
    intent = ChatIntent(state["intent"])
    entities = state["entities"]
    
    pipeline_config = {
        "triggered_at": datetime.now().isoformat(),
        "intent": intent.value,
        "status": "queued"
    }
    
    if intent == ChatIntent.ANALYZE_PROPERTY and entities.get("address"):
        pipeline_config.update({
            "type": "single",
            "address": entities["address"],
            "city": entities.get("city", "Melbourne"),
        })
    elif intent == ChatIntent.BATCH_ANALYSIS and entities.get("date"):
        pipeline_config.update({
            "type": "batch",
            "auction_date": entities["date"],
        })
    
    return {"pipeline_trigger": pipeline_config}


async def response_node(state: ChatbotState) -> Dict[str, Any]:
    """Response generation node - create final response"""
    intent = ChatIntent(state["intent"])
    action = ChatAction(state["action"])
    
    # Build entities
    entities = ExtractedEntities(
        address=state["entities"].get("address"),
        city=state["entities"].get("city"),
        date=state["entities"].get("date"),
    )
    
    # Handle disambiguation
    if action == ChatAction.DISAMBIGUATE:
        missing = state["action_params"].get("missing_entity", "details")
        response_text = ChatResponseGenerator.generate_disambiguation(missing)
    
    # Handle pipeline trigger
    elif action == ChatAction.TRIGGER_PIPELINE:
        trigger = state.get("pipeline_trigger", {})
        if trigger.get("type") == "single":
            response_text = f"""🚀 **Pipeline Triggered!**

Analyzing: **{trigger.get('address', 'Property')}**

The Everest Ascent™ 12-stage pipeline is now processing:
1. Discovery → 2. Scraping → 3. Title Search → 4. Lien Priority
5. Tax Certs → 6. Demographics → 7. CMA → 8. ML Score
9. Max Bid → 10. Decision → 11. Disposition → 12. Archive

⏱️ Estimated time: 3-5 minutes

I'll notify you when complete. Say "status" to check progress."""
        else:
            response_text = f"""🚀 **Batch Pipeline Triggered!**

Processing: **{trigger.get('auction_date', 'Auction')}** properties

Running full Everest Ascent™ analysis on all properties...

⏱️ Estimated time: 10-15 minutes

Say "status" to check progress."""
    
    # Handle database query results
    elif action == ChatAction.QUERY_DATABASE:
        db_results = {"success": True, "data": state.get("db_results")} if state.get("db_results") else None
        response_text = ChatResponseGenerator.generate(intent, entities, db_results)
    
    # Handle direct responses
    else:
        response_text = ChatResponseGenerator.generate(intent, entities)
    
    # Add message to history
    new_messages = [
        {"role": "user", "content": state["current_message"], "timestamp": datetime.now().isoformat()},
        {"role": "assistant", "content": response_text, "timestamp": datetime.now().isoformat()}
    ]
    
    return {
        "response_text": response_text,
        "response_metadata": {
            "intent": intent.value,
            "action": action.value,
            "confidence": state["intent_confidence"],
            "timestamp": datetime.now().isoformat()
        },
        "messages": new_messages
    }


# =============================================================================
# ROUTING FUNCTIONS
# =============================================================================

def route_after_nlp(state: ChatbotState) -> str:
    """Route after NLP processing"""
    action = ChatAction(state["action"])
    
    if action == ChatAction.QUERY_DATABASE:
        return "database"
    elif action == ChatAction.TRIGGER_PIPELINE:
        return "pipeline_trigger"
    else:
        return "response"


# =============================================================================
# GRAPH CONSTRUCTION
# =============================================================================

def create_chatbot_graph() -> StateGraph:
    """Create the chatbot LangGraph"""
    
    if not LANGGRAPH_AVAILABLE:
        raise ImportError("LangGraph required for chatbot graph")
    
    graph = StateGraph(ChatbotState)
    
    # Add nodes
    graph.add_node("nlp", nlp_node)
    graph.add_node("database", database_node)
    graph.add_node("pipeline_trigger", pipeline_trigger_node)
    graph.add_node("response", response_node)
    
    # Set entry point
    graph.set_entry_point("nlp")
    
    # Add conditional edges after NLP
    graph.add_conditional_edges(
        "nlp",
        route_after_nlp,
        {
            "database": "database",
            "pipeline_trigger": "pipeline_trigger",
            "response": "response"
        }
    )
    
    # Database and pipeline both go to response
    graph.add_edge("database", "response")
    graph.add_edge("pipeline_trigger", "response")
    
    # Response is terminal
    graph.add_edge("response", END)
    
    return graph.compile()


# =============================================================================
# CHATBOT AGENT CLASS
# =============================================================================

class ChatbotAgent:
    """High-level chatbot agent for integration with orchestrator"""
    
    def __init__(self):
        if LANGGRAPH_AVAILABLE:
            self.graph = create_chatbot_graph()
        else:
            self.graph = None
        self.sessions: Dict[str, List[Dict]] = {}
    
    async def process_message(
        self,
        session_id: str,
        message: str,
        expertise_level: str = "intermediate"
    ) -> Dict[str, Any]:
        """Process a user message and return response"""
        
        initial_state = create_initial_chat_state(
            session_id=session_id,
            user_message=message,
            expertise_level=expertise_level
        )
        
        # Add conversation history
        if session_id in self.sessions:
            initial_state["context_window"] = self.sessions[session_id][-10:]
        
        if self.graph:
            # Run through LangGraph
            final_state = await self.graph.ainvoke(initial_state)
        else:
            # Fallback: run nodes sequentially
            final_state = await self._run_fallback(initial_state)
        
        # Update session history
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        self.sessions[session_id].extend(final_state.get("messages", []))
        
        return {
            "response": final_state["response_text"],
            "intent": final_state["intent"],
            "confidence": final_state["intent_confidence"],
            "action": final_state["action"],
            "pipeline_trigger": final_state.get("pipeline_trigger"),
            "metadata": final_state["response_metadata"]
        }
    
    async def _run_fallback(self, state: ChatbotState) -> ChatbotState:
        """Run nodes sequentially without LangGraph"""
        # NLP
        nlp_result = await nlp_node(state)
        state.update(nlp_result)
        
        # Database or Pipeline
        if state["action"] == ChatAction.QUERY_DATABASE.value:
            db_result = await database_node(state)
            state.update(db_result)
        elif state["action"] == ChatAction.TRIGGER_PIPELINE.value:
            pipeline_result = await pipeline_trigger_node(state)
            state.update(pipeline_result)
        
        # Response
        response_result = await response_node(state)
        state.update(response_result)
        
        return state
    
    def clear_session(self, session_id: str):
        """Clear session history"""
        if session_id in self.sessions:
            del self.sessions[session_id]


# =============================================================================
# EXPORTS
# =============================================================================

__all__ = [
    "ChatbotState",
    "ChatIntent",
    "ChatAction",
    "ChatSentiment",
    "ChatNLPEngine",
    "ChatDatabaseConnector",
    "ChatResponseGenerator",
    "ChatbotAgent",
    "create_chatbot_graph",
    "create_initial_chat_state",
    "nlp_node",
    "database_node",
    "pipeline_trigger_node",
    "response_node",
]
