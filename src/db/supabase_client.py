"""
BidDeed.AI - Supabase Client
Async-compatible Supabase client for LangGraph integration.
"""

import os
import httpx
from typing import List, Dict, Any, Optional

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mocerqjnksmhcjzxrewo.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")


class SupabaseClient:
    """Async Supabase REST client for LangGraph orchestrator."""
    
    def __init__(self, url: str = None, key: str = None):
        self.url = url or SUPABASE_URL
        self.key = key or SUPABASE_KEY
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    
    async def insert(self, table: str, data: Dict[str, Any]) -> Optional[Dict]:
        """Insert a single row into a table (async)."""
        async with httpx.AsyncClient(headers=self.headers, timeout=30) as client:
            resp = await client.post(
                f"{self.url}/rest/v1/{table}",
                json=data if isinstance(data, list) else [data]
            )
            if resp.status_code in [200, 201]:
                result = resp.json()
                return result[0] if isinstance(result, list) and result else result
            return None
    
    async def upsert(self, table: str, data: Dict[str, Any], on_conflict: str = "id") -> Optional[Dict]:
        """Upsert a row (insert or update on conflict) - async."""
        headers = {**self.headers, "Prefer": "resolution=merge-duplicates,return=representation"}
        async with httpx.AsyncClient(headers=headers, timeout=30) as client:
            resp = await client.post(
                f"{self.url}/rest/v1/{table}",
                json=data if isinstance(data, list) else [data]
            )
            if resp.status_code in [200, 201]:
                result = resp.json()
                return result[0] if isinstance(result, list) and result else result
            return None
    
    async def select(self, table: str, filters: Dict[str, str] = None, limit: int = 100) -> List[Dict]:
        """Select rows from a table (async)."""
        # Build filter string
        filter_str = "&".join(f"{k}={v}" for k, v in (filters or {}).items())
        url = f"{self.url}/rest/v1/{table}?{filter_str}&limit={limit}"
        
        async with httpx.AsyncClient(headers=self.headers, timeout=30) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                return resp.json()
            return []
    
    async def update(self, table: str, filters: Dict[str, str], data: Dict[str, Any]) -> bool:
        """Update rows matching filters (async)."""
        filter_str = "&".join(f"{k}={v}" for k, v in filters.items())
        url = f"{self.url}/rest/v1/{table}?{filter_str}"
        
        async with httpx.AsyncClient(headers=self.headers, timeout=30) as client:
            resp = await client.patch(url, json=data)
            return resp.status_code in [200, 204]
    
    async def delete(self, table: str, filters: Dict[str, str]) -> bool:
        """Delete rows matching filters (async)."""
        filter_str = "&".join(f"{k}={v}" for k, v in filters.items())
        url = f"{self.url}/rest/v1/{table}?{filter_str}"
        
        async with httpx.AsyncClient(headers=self.headers, timeout=30) as client:
            resp = await client.delete(url)
            return resp.status_code in [200, 204]


# Convenience function
def get_client() -> SupabaseClient:
    """Get a SupabaseClient instance."""
    return SupabaseClient()


__all__ = ["SupabaseClient", "get_client"]
