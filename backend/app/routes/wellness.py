from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

from app.database.connection import get_db
from app.models import User, WellnessProfile, FocusSession, GameScore, Badge
from app.utils.auth import get_current_user

router = APIRouter(prefix="/wellness", tags=["Wellness"])

def get_or_create_profile(db: Session, user_id: int) -> WellnessProfile:
    profile = db.query(WellnessProfile).filter(WellnessProfile.user_id == user_id).first()
    if not profile:
        profile = WellnessProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.get("/profile")
def get_wellness_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = get_or_create_profile(db, current_user.id)
    
    # Calculate weekly focus hours
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    recent_sessions = db.query(FocusSession).filter(
        FocusSession.user_id == current_user.id,
        FocusSession.completed_at >= one_week_ago
    ).all()
    
    focus_minutes = sum(s.duration_minutes for s in recent_sessions)
    profile.focus_hours_weekly = round(focus_minutes / 60.0, 1)
    
    # Get recent game scores
    games = db.query(GameScore).filter(GameScore.user_id == current_user.id).order_by(GameScore.played_at.desc()).limit(10).all()
    
    # Get badges
    badges = db.query(Badge).filter(Badge.user_id == current_user.id).all()
    
    # Update last active
    profile.last_active = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    
    return {
        "profile": {
            "total_points": profile.total_points,
            "current_streak": profile.current_streak,
            "focus_hours_weekly": profile.focus_hours_weekly,
            "wellness_score": profile.wellness_score,
        },
        "recent_games": [
            {
                "id": g.id,
                "game_name": g.game_name,
                "score": g.score,
                "result": g.result,
                "played_at": g.played_at
            } for g in games
        ],
        "badges": [b.badge_name for b in badges],
        "total_focus_sessions": db.query(FocusSession).filter(FocusSession.user_id == current_user.id).count()
    }

@router.post("/session")
def record_focus_session(
    session_type: str,
    duration_minutes: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = FocusSession(
        user_id=current_user.id,
        session_type=session_type,
        duration_minutes=duration_minutes
    )
    db.add(session)
    
    profile = get_or_create_profile(db, current_user.id)
    profile.total_points += (duration_minutes // 5) * 10  # 10 points per 5 mins
    
    # Check for Focus Master badge
    total_sessions = db.query(FocusSession).filter(FocusSession.user_id == current_user.id).count()
    if total_sessions >= 10:
        existing_badge = db.query(Badge).filter(Badge.user_id == current_user.id, Badge.badge_name == "Focus Master").first()
        if not existing_badge:
            db.add(Badge(user_id=current_user.id, badge_name="Focus Master"))
            profile.total_points += 50
    
    db.commit()
    return {"message": "Session recorded successfully", "points_earned": (duration_minutes // 5) * 10}

@router.post("/game-score")
def record_game_score(
    game_name: str,
    score: int = 0,
    result: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game_score = GameScore(
        user_id=current_user.id,
        game_name=game_name,
        score=score,
        result=result
    )
    db.add(game_score)
    
    profile = get_or_create_profile(db, current_user.id)
    if result == 'Win':
        profile.total_points += 20
    else:
        profile.total_points += 5
        
    db.commit()
    return {"message": "Score recorded"}

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profiles = db.query(WellnessProfile).order_by(WellnessProfile.total_points.desc()).limit(10).all()
    
    leaderboard = []
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        if user:
            leaderboard.append({
                "id": user.id,
                "name": user.name,
                "department": user.department,
                "points": p.total_points,
                "focus_hours": p.focus_hours_weekly,
                "badges": db.query(Badge).filter(Badge.user_id == user.id).count()
            })
            
    return {"leaderboard": leaderboard}
