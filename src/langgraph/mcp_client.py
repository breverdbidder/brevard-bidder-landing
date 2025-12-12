"""
BidDeed.AI MCP Client Integration
======================================
Version: 1.0.0
Created: December 11, 2025

Integrates Model Context Protocol (MCP) servers with LangGraph orchestrator.
Provides standardized tool access for:
- Supabase (database operations)
- PDF OCR (document extraction)
- GitHub (deployment automation)
- Brave Search (web research)
"""

import os
import json
import asyncio
import httpx
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from datetime import datetime


@dataclass
class MCPToolResult:
    """Result from an MCP tool call."""
    success: bool
    data: Any
    error: Optional[str] = None
    tool_name: str = ""
    server: str = ""
    duration_ms: float = 0


class MCPClientManager:
    """Manages connections to multiple MCP servers."""
    
    def __init__(self):
        self.http_client: Optional[httpx.AsyncClient] = None
        self.supabase_url = os.getenv("SUPABASE_URL", "https://mocerqjnksmhcjzxrewo.supabase.co")
        self.supabase_key = os.getenv("SUPABASE_KEY", "")
        self.github_token = os.getenv("GITHUB_TOKEN", "")
        self._connected = False
    
    async def __aenter__(self):
        self.http_client = httpx.AsyncClient(timeout=60.0)
        self._connected = True
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.http_client:
            await self.http_client.aclose()
        self._connected = False
    
    async def supabase_query(self, table: str, filters: Dict = None, limit: int = 100) -> MCPToolResult:
        """Query Supabase table."""
        start = datetime.now()
        try:
            url = f"{self.supabase_url}/rest/v1/{table}"
            params = {"limit": str(limit)}
            if filters:
                for k, v in filters.items():
                    params[k] = f"eq.{v}"
            
            response = await self.http_client.get(
                url,
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                },
                params=params
            )
            
            return MCPToolResult(
                success=response.status_code == 200,
                data=response.json() if response.status_code == 200 else None,
                error=None if response.status_code == 200 else response.text,
                tool_name="query",
                server="supabase",
                duration_ms=(datetime.now() - start).total_seconds() * 1000
            )
        except Exception as e:
            return MCPToolResult(success=False, data=None, error=str(e), tool_name="query", server="supabase")
    
    async def supabase_insert(self, table: str, data: Dict[str, Any]) -> MCPToolResult:
        """Insert record into Supabase table."""
        start = datetime.now()
        try:
            response = await self.http_client.post(
                f"{self.supabase_url}/rest/v1/{table}",
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json=data
            )
            return MCPToolResult(
                success=response.status_code in [200, 201],
                data=response.json() if response.status_code in [200, 201] else None,
                error=None if response.status_code in [200, 201] else response.text,
                tool_name="insert",
                server="supabase",
                duration_ms=(datetime.now() - start).total_seconds() * 1000
            )
        except Exception as e:
            return MCPToolResult(success=False, data=None, error=str(e), tool_name="insert", server="supabase")
    
    async def supabase_upsert(self, table: str, data: Dict[str, Any]) -> MCPToolResult:
        """Upsert record into Supabase table."""
        start = datetime.now()
        try:
            response = await self.http_client.post(
                f"{self.supabase_url}/rest/v1/{table}",
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation,resolution=merge-duplicates"
                },
                json=data
            )
            return MCPToolResult(
                success=response.status_code in [200, 201],
                data=response.json() if response.status_code in [200, 201] else None,
                error=None if response.status_code in [200, 201] else response.text,
                tool_name="upsert",
                server="supabase",
                duration_ms=(datetime.now() - start).total_seconds() * 1000
            )
        except Exception as e:
            return MCPToolResult(success=False, data=None, error=str(e), tool_name="upsert", server="supabase")
    
    async def pdf_extract_text(self, pdf_url: str) -> MCPToolResult:
        """Extract text from PDF using pdfplumber."""
        start = datetime.now()
        try:
            pdf_response = await self.http_client.get(pdf_url)
            if pdf_response.status_code != 200:
                return MCPToolResult(success=False, data=None, error=f"Download failed: {pdf_response.status_code}", tool_name="pdf_ocr", server="pdf-ocr")
            
            import io
            import pdfplumber
            with pdfplumber.open(io.BytesIO(pdf_response.content)) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() or ""
                return MCPToolResult(
                    success=True,
                    data={"text": text, "pages": len(pdf.pages)},
                    tool_name="read_pdf_text",
                    server="pdf-ocr",
                    duration_ms=(datetime.now() - start).total_seconds() * 1000
                )
        except Exception as e:
            return MCPToolResult(success=False, data=None, error=str(e), tool_name="pdf_ocr", server="pdf-ocr")
    
    async def github_commit(self, repo: str, path: str, content: str, message: str) -> MCPToolResult:
        """Commit file to GitHub repository."""
        import base64
        start = datetime.now()
        try:
            sha = None
            existing = await self.http_client.get(
                f"https://api.github.com/repos/{repo}/contents/{path}",
                headers={"Authorization": f"token {self.github_token}", "Accept": "application/vnd.github+json"}
            )
            if existing.status_code == 200:
                sha = existing.json().get("sha")
            
            payload = {"message": message, "content": base64.b64encode(content.encode()).decode()}
            if sha:
                payload["sha"] = sha
            
            response = await self.http_client.put(
                f"https://api.github.com/repos/{repo}/contents/{path}",
                headers={"Authorization": f"token {self.github_token}", "Accept": "application/vnd.github+json", "Content-Type": "application/json"},
                json=payload
            )
            return MCPToolResult(
                success=response.status_code in [200, 201],
                data=response.json() if response.status_code in [200, 201] else None,
                error=None if response.status_code in [200, 201] else response.text,
                tool_name="create_or_update_file",
                server="github",
                duration_ms=(datetime.now() - start).total_seconds() * 1000
            )
        except Exception as e:
            return MCPToolResult(success=False, data=None, error=str(e), tool_name="github_commit", server="github")
    
    async def github_trigger_workflow(self, repo: str, workflow: str, inputs: Dict[str, str]) -> MCPToolResult:
        """Trigger GitHub Actions workflow."""
        start = datetime.now()
        try:
            response = await self.http_client.post(
                f"https://api.github.com/repos/{repo}/actions/workflows/{workflow}/dispatches",
                headers={"Authorization": f"token {self.github_token}", "Accept": "application/vnd.github+json", "Content-Type": "application/json"},
                json={"ref": "main", "inputs": inputs}
            )
            return MCPToolResult(
                success=response.status_code == 204,
                data={"triggered": True} if response.status_code == 204 else None,
                error=None if response.status_code == 204 else response.text,
                tool_name="workflow_dispatch",
                server="github",
                duration_ms=(datetime.now() - start).total_seconds() * 1000
            )
        except Exception as e:
            return MCPToolResult(success=False, data=None, error=str(e), tool_name="workflow_dispatch", server="github")


# Singleton
_mcp_client: Optional[MCPClientManager] = None

async def get_mcp_client() -> MCPClientManager:
    global _mcp_client
    if _mcp_client is None or not _mcp_client._connected:
        _mcp_client = MCPClientManager()
        await _mcp_client.__aenter__()
    return _mcp_client

async def close_mcp_client():
    global _mcp_client
    if _mcp_client and _mcp_client._connected:
        await _mcp_client.__aexit__(None, None, None)
        _mcp_client = None
