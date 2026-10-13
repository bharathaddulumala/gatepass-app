import os
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class GatePassModel(Base):
    __tablename__ = "gate_passes_v2"
    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String)
    roll_number = Column(String, index=True)
    reason = Column(String)
    # Status progression: "Pending Mentor", "Rejected by Mentor", "Pending Dean", "Approved by Dean", "Rejected by Dean"
    status = Column(String, default="Pending Mentor")
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class PassCreate(BaseModel):
    student_name: str
    roll_number: str
    reason: str

class StatusUpdate(BaseModel):
    status: str

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# 1. Student Submission
@app.post("/api/passes/")
def create_pass(pass_data: PassCreate, db: Session = Depends(get_db)):
    db_pass = GatePassModel(
        student_name=pass_data.student_name,
        roll_number=pass_data.roll_number,
        reason=pass_data.reason
    )
    db.add(db_pass)
    db.commit()
    return {"message": "Pass submitted to your Mentor!"}

# 2. Get All Passes (Filtered for Dashboards)
@app.get("/api/passes/")
def list_passes(db: Session = Depends(get_db)):
    return db.query(GatePassModel).order_by(GatePassModel.created_at.desc()).all()

# 3. Update Status (Used by Mentor and Dean)
@app.put("/api/passes/{pass_id}/status")
def update_pass_status(pass_id: int, data: StatusUpdate, db: Session = Depends(get_db)):
    db_pass = db.query(GatePassModel).filter(GatePassModel.id == pass_id).first()
    if not db_pass:
        raise HTTPException(status_code=404, detail="Pass not found")
    db_pass.status = data.status
    db.commit()
    return {"message": f"Status updated to {data.status}"}

# 4. Security Search View
@app.get("/api/security/{roll_number}")
def security_check(roll_number: str, db: Session = Depends(get_db)):
    # Find the latest request for this student
    latest_pass = db.query(GatePassModel).filter(GatePassModel.roll_number == roll_number).order_by(GatePassModel.created_at.desc()).first()
    if not latest_pass:
        return {"status": "No Record Found", "message": "Student has never requested a pass."}
    return {
        "student_name": latest_pass.student_name,
        "status": latest_pass.status,
        "allowed_to_leave": latest_pass.status == "Approved by Dean"
    }

# 5. Dean Weekly Report Analytics with Red Flags 🚩
@app.get("/api/dean/weekly-report")
def get_weekly_report(db: Session = Depends(get_db)):
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    
    # Count total requests per student in the last 7 days
    results = db.query(
        GatePassModel.student_name,
        GatePassModel.roll_number,
        func.count(GatePassModel.id).label("total_requests")
    ).filter(GatePassModel.created_at >= one_week_ago)\
     .group_by(GatePassModel.student_name, GatePassModel.roll_number).all()
     
    report = []
    for r in results:
        report.append({
            "student_name": r.student_name,
            "roll_number": r.roll_number,
            "count_this_week": r.total_requests,
            "red_flag": r.total_requests >= 3  # RED FLAG triggers if 3 or more requests this week
        })
    return report
