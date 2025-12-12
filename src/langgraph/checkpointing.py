"""
BidDeed.AI Checkpointing Module
====================================
Version: 14.0.0
Created: December 11, 2025

SQLite-based checkpointing for crash recovery in long-running pipelines.
Supports:
- Automatic checkpointing at each stage
- Manual checkpoint creation
- Resume from any checkpoint
- Checkpoint listing and cleanup

Usage:
    from src.langgraph.checkpointing import BrevardCheckpointer
    
    # Create checkpointer
    cp = BrevardCheckpointer("checkpoints/brevard.db")
    
    # List checkpoints for a thread
    checkpoints = cp.list_checkpoints("auction_05-2024-CA-012345")
    
    # Resume from checkpoint
    state = cp.load_checkpoint("auction_05-2024-CA-012345", checkpoint_id="cp_12345")
"""

import os
import json
import sqlite3
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
from contextlib import contextmanager

from langgraph.checkpoint.sqlite import SqliteSaver


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class CheckpointInfo:
    """Metadata about a checkpoint."""
    checkpoint_id: str
    thread_id: str
    stage: str
    created_at: datetime
    state_summary: Dict[str, Any]
    errors_count: int
    is_valid: bool


# =============================================================================
# BREVARD CHECKPOINTER
# =============================================================================

class BrevardCheckpointer:
    """
    Enhanced checkpointer for BidDeed.AI pipelines.
    
    Wraps LangGraph's SqliteSaver with additional functionality:
    - Human-readable checkpoint metadata
    - Stage-based checkpoint naming
    - Automatic cleanup of old checkpoints
    - Checkpoint validation
    """
    
    def __init__(self, db_path: str = "checkpoints/biddeed.db"):
        """
        Initialize checkpointer.
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # Initialize LangGraph saver
        self.saver = SqliteSaver.from_conn_string(db_path)
        
        # Initialize our metadata table
        self._init_metadata_table()
    
    def _init_metadata_table(self):
        """Create metadata table if not exists."""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS checkpoint_metadata (
                    checkpoint_id TEXT PRIMARY KEY,
                    thread_id TEXT NOT NULL,
                    stage TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    state_summary TEXT,
                    errors_count INTEGER DEFAULT 0,
                    is_valid INTEGER DEFAULT 1,
                    case_number TEXT,
                    recommendation TEXT
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_thread_id 
                ON checkpoint_metadata(thread_id)
            """)
            conn.commit()
    
    @contextmanager
    def _get_connection(self):
        """Context manager for database connection."""
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
        finally:
            conn.close()
    
    def save_checkpoint_metadata(
        self,
        checkpoint_id: str,
        thread_id: str,
        state: Dict[str, Any]
    ):
        """
        Save human-readable metadata for a checkpoint.
        
        Args:
            checkpoint_id: Unique checkpoint identifier
            thread_id: Pipeline thread ID
            state: Current BrevardBidderState
        """
        with self._get_connection() as conn:
            summary = {
                "case_number": state.get("identifiers", {}).get("case_number"),
                "address": state.get("identifiers", {}).get("address"),
                "current_stage": state.get("current_stage"),
                "has_recommendation": state.get("recommendation") is not None,
                "max_bid": state.get("bid_calc", {}).get("max_bid") if state.get("bid_calc") else None
            }
            
            conn.execute("""
                INSERT OR REPLACE INTO checkpoint_metadata 
                (checkpoint_id, thread_id, stage, created_at, state_summary, 
                 errors_count, is_valid, case_number, recommendation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                checkpoint_id,
                thread_id,
                state.get("current_stage", "unknown"),
                datetime.now().isoformat(),
                json.dumps(summary),
                len(state.get("errors", [])),
                1,
                state.get("identifiers", {}).get("case_number"),
                state.get("recommendation", {}).get("recommendation", "").value 
                    if state.get("recommendation") else None
            ))
            conn.commit()
    
    def list_checkpoints(self, thread_id: str) -> List[CheckpointInfo]:
        """
        List all checkpoints for a thread.
        
        Args:
            thread_id: Pipeline thread ID
            
        Returns:
            List of CheckpointInfo objects
        """
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT checkpoint_id, thread_id, stage, created_at, 
                       state_summary, errors_count, is_valid
                FROM checkpoint_metadata
                WHERE thread_id = ?
                ORDER BY created_at DESC
            """, (thread_id,))
            
            checkpoints = []
            for row in cursor.fetchall():
                checkpoints.append(CheckpointInfo(
                    checkpoint_id=row[0],
                    thread_id=row[1],
                    stage=row[2],
                    created_at=datetime.fromisoformat(row[3]),
                    state_summary=json.loads(row[4]) if row[4] else {},
                    errors_count=row[5],
                    is_valid=bool(row[6])
                ))
            
            return checkpoints
    
    def get_latest_checkpoint(self, thread_id: str) -> Optional[CheckpointInfo]:
        """
        Get the most recent valid checkpoint for a thread.
        
        Args:
            thread_id: Pipeline thread ID
            
        Returns:
            CheckpointInfo or None
        """
        checkpoints = self.list_checkpoints(thread_id)
        valid_checkpoints = [cp for cp in checkpoints if cp.is_valid]
        return valid_checkpoints[0] if valid_checkpoints else None
    
    def invalidate_checkpoint(self, checkpoint_id: str):
        """
        Mark a checkpoint as invalid (e.g., after discovering data issues).
        
        Args:
            checkpoint_id: Checkpoint to invalidate
        """
        with self._get_connection() as conn:
            conn.execute("""
                UPDATE checkpoint_metadata 
                SET is_valid = 0 
                WHERE checkpoint_id = ?
            """, (checkpoint_id,))
            conn.commit()
    
    def cleanup_old_checkpoints(self, days: int = 30, keep_latest: int = 5):
        """
        Remove old checkpoints to save disk space.
        
        Args:
            days: Delete checkpoints older than this many days
            keep_latest: Always keep at least this many per thread
        """
        from datetime import timedelta
        
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        
        with self._get_connection() as conn:
            # Get thread IDs
            threads = conn.execute(
                "SELECT DISTINCT thread_id FROM checkpoint_metadata"
            ).fetchall()
            
            for (thread_id,) in threads:
                # Get checkpoints for this thread, ordered by date
                checkpoints = conn.execute("""
                    SELECT checkpoint_id, created_at
                    FROM checkpoint_metadata
                    WHERE thread_id = ?
                    ORDER BY created_at DESC
                """, (thread_id,)).fetchall()
                
                # Keep latest N, delete old ones
                to_delete = []
                for i, (cp_id, created_at) in enumerate(checkpoints):
                    if i >= keep_latest and created_at < cutoff:
                        to_delete.append(cp_id)
                
                if to_delete:
                    placeholders = ",".join(["?"] * len(to_delete))
                    conn.execute(f"""
                        DELETE FROM checkpoint_metadata 
                        WHERE checkpoint_id IN ({placeholders})
                    """, to_delete)
            
            conn.commit()
    
    def get_recovery_info(self, thread_id: str) -> Dict[str, Any]:
        """
        Get information needed to resume a failed pipeline.
        
        Args:
            thread_id: Pipeline thread ID
            
        Returns:
            Dict with recovery information
        """
        latest = self.get_latest_checkpoint(thread_id)
        
        if not latest:
            return {
                "can_resume": False,
                "reason": "No valid checkpoints found"
            }
        
        return {
            "can_resume": True,
            "checkpoint_id": latest.checkpoint_id,
            "stage": latest.stage,
            "created_at": latest.created_at.isoformat(),
            "errors_count": latest.errors_count,
            "state_summary": latest.state_summary,
            "resume_command": f"resume_from_checkpoint('{thread_id}')"
        }


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

def create_checkpoint(
    state: Dict[str, Any],
    thread_id: str,
    db_path: str = "checkpoints/biddeed.db"
) -> str:
    """
    Create a manual checkpoint.
    
    Args:
        state: Current BrevardBidderState
        thread_id: Pipeline thread ID
        db_path: Path to checkpoint database
        
    Returns:
        Checkpoint ID
    """
    from uuid import uuid4
    
    checkpointer = BrevardCheckpointer(db_path)
    checkpoint_id = f"cp_{uuid4().hex[:8]}"
    
    checkpointer.save_checkpoint_metadata(checkpoint_id, thread_id, state)
    
    return checkpoint_id


def load_checkpoint(
    thread_id: str,
    checkpoint_id: Optional[str] = None,
    db_path: str = "checkpoints/biddeed.db"
) -> Optional[Dict[str, Any]]:
    """
    Load state from a checkpoint.
    
    Args:
        thread_id: Pipeline thread ID
        checkpoint_id: Specific checkpoint (default: latest)
        db_path: Path to checkpoint database
        
    Returns:
        Checkpoint state or None
    """
    checkpointer = BrevardCheckpointer(db_path)
    
    if checkpoint_id:
        # Load specific checkpoint
        checkpoints = checkpointer.list_checkpoints(thread_id)
        for cp in checkpoints:
            if cp.checkpoint_id == checkpoint_id:
                return cp.state_summary
        return None
    else:
        # Load latest
        latest = checkpointer.get_latest_checkpoint(thread_id)
        return latest.state_summary if latest else None


def list_checkpoints(
    thread_id: str,
    db_path: str = "checkpoints/biddeed.db"
) -> List[CheckpointInfo]:
    """
    List all checkpoints for a thread.
    
    Args:
        thread_id: Pipeline thread ID
        db_path: Path to checkpoint database
        
    Returns:
        List of CheckpointInfo objects
    """
    checkpointer = BrevardCheckpointer(db_path)
    return checkpointer.list_checkpoints(thread_id)


# =============================================================================
# STAGE CHECKPOINT DECORATOR
# =============================================================================

def checkpoint_stage(stage_name: str):
    """
    Decorator to automatically checkpoint after a stage completes.
    
    Usage:
        @checkpoint_stage("lien_priority")
        async def lien_priority_node(state):
            ...
    """
    def decorator(func):
        async def wrapper(state, *args, **kwargs):
            result = await func(state, *args, **kwargs)
            
            # Auto-checkpoint after stage
            thread_id = state.get("run_id", "unknown")
            checkpoint_id = f"auto_{stage_name}_{datetime.now().strftime('%H%M%S')}"
            
            checkpointer = BrevardCheckpointer()
            checkpointer.save_checkpoint_metadata(checkpoint_id, thread_id, state)
            
            return result
        return wrapper
    return decorator


# =============================================================================
# CLI
# =============================================================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python checkpointing.py <command> [args]")
        print("Commands:")
        print("  list <thread_id>     - List checkpoints for a thread")
        print("  info <thread_id>     - Get recovery info for a thread")
        print("  cleanup [days]       - Clean up old checkpoints")
        sys.exit(1)
    
    command = sys.argv[1]
    cp = BrevardCheckpointer()
    
    if command == "list" and len(sys.argv) >= 3:
        thread_id = sys.argv[2]
        checkpoints = cp.list_checkpoints(thread_id)
        print(f"\nCheckpoints for {thread_id}:")
        for c in checkpoints:
            valid = "✅" if c.is_valid else "❌"
            print(f"  {valid} {c.checkpoint_id} | Stage: {c.stage} | {c.created_at}")
    
    elif command == "info" and len(sys.argv) >= 3:
        thread_id = sys.argv[2]
        info = cp.get_recovery_info(thread_id)
        print(f"\nRecovery info for {thread_id}:")
        for k, v in info.items():
            print(f"  {k}: {v}")
    
    elif command == "cleanup":
        days = int(sys.argv[2]) if len(sys.argv) >= 3 else 30
        cp.cleanup_old_checkpoints(days=days)
        print(f"Cleaned up checkpoints older than {days} days")
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
