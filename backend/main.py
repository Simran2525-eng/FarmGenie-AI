from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import httpx
import os
from typing import List, Optional
from database import get_db_connection, init_db

app = FastAPI(title="FarmGenie AI Backend")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Models
class SettingsModel(BaseModel):
    state: str
    district: str
    soil_type: str
    water_availability: str
    gemini_api_key: Optional[str] = ""

class RecommendRequest(BaseModel):
    state: str
    district: str
    soil_type: str
    water_availability: str
    farm_size: float
    month: str
    season: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

# Routes
@app.get("/api/settings")
def get_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT state, district, soil_type, water_availability, gemini_api_key FROM settings WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    raise HTTPException(status_code=404, detail="Settings not found")

@app.post("/api/settings")
def update_settings(settings: SettingsModel):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE settings
        SET state = ?, district = ?, soil_type = ?, water_availability = ?, gemini_api_key = ?
        WHERE id = 1
    """, (settings.state, settings.district, settings.soil_type, settings.water_availability, settings.gemini_api_key))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Settings updated successfully"}

@app.get("/api/schemes")
def get_schemes(state: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if state and state.lower() != "national":
        cursor.execute("SELECT * FROM schemes WHERE LOWER(state) = ? OR LOWER(state) = 'national'", (state.lower(),))
    else:
        cursor.execute("SELECT * FROM schemes")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/recommend")
def recommend_crop(req: RecommendRequest):
    # Rule-based crop recommendations
    season_lower = req.season.lower()
    soil_lower = req.soil_type.lower()
    water_lower = req.water_availability.lower()
    
    # Defaults
    crop = "Pigeon Pea (Arhar)"
    seed = "ICPL 87119 (Asha)"
    sowing = "June"
    duration = "160 - 180 days"
    fertilizer = "NPK 20:50:20 kg/ha. Apply sulfur-containing fertilizers."
    irrigation = "Drought-tolerant. Requires minimal irrigation, mainly during pod-development."
    yield_est = "0.6 - 0.9 tons"
    profit_est = "22,000 - 30,000"
    reason = "Arhar is a hardy legume suitable for all soil types under rainfed conditions with low water needs."

    if "kharif" in season_lower or req.month.lower() in ["june", "july", "august", "september"]:
        if ("black" in soil_lower or "clay" in soil_lower) and water_lower in ["high", "moderate"]:
            crop = "Rice / Paddy"
            seed = "Pusa Basmati 1121 / IR 64"
            sowing = "June - July"
            duration = "120 - 140 days"
            fertilizer = "NPK 120:60:40 kg/ha. Apply Zinc Sulphate in zinc deficient soils."
            irrigation = "High water requirement. Maintain 5cm standing water in the field or use alternate wetting and drying."
            yield_est = "2.2 - 2.8 tons"
            profit_est = "35,000 - 45,000"
            reason = f"Black/Clayey soil retains moisture exceptionally well. Your {water_lower} water availability matches Rice's water-intensive nature, and {req.month} falls perfectly in the Kharif crop cycle."
        elif "black" in soil_lower and water_lower in ["low", "moderate"]:
            crop = "Soybean"
            seed = "JS 335 / NRC 37"
            sowing = "June"
            duration = "95 - 105 days"
            fertilizer = "NPK 20:60:40 kg/ha + Rhizobium seed treatment."
            irrigation = "Primarily rainfed. Requires supplemental irrigation only during flowering and pod-filling if dry spells exceed 15 days."
            yield_est = "0.8 - 1.2 tons"
            profit_est = "25,000 - 32,000"
            reason = "Soybean is highly suited for black soils with low to moderate water availability, as it is a resilient oilseed crop that improves nitrogen fixation."
        elif ("sandy" in soil_lower or "loam" in soil_lower) and water_lower in ["moderate", "high"]:
            crop = "Maize (Corn)"
            seed = "Deccan 103 / Ganga 11"
            sowing = "June - July"
            duration = "100 - 115 days"
            fertilizer = "NPK 100:50:50 kg/ha. Apply nitrogen in three split doses."
            irrigation = "Moderate water requirement. Ensure good drainage. Irrigate at tasseling and silking stages."
            yield_est = "1.8 - 2.4 tons"
            profit_est = "28,000 - 35,000"
            reason = f"Maize thrives in well-drained {req.soil_type} soil during the warm Kharif season, requiring moderate water."
        elif ("black" in soil_lower or "alluvial" in soil_lower) and water_lower in ["moderate", "high"]:
            crop = "Cotton"
            seed = "Bt Cotton (Bollgard II)"
            sowing = "May - June"
            duration = "150 - 180 days"
            fertilizer = "NPK 120:60:60 kg/ha. Micronutrients like Boron and Magnesium are recommended."
            irrigation = "Moderate water requirement. Drip irrigation is highly recommended to control moisture and prevent waterlogging."
            yield_est = "0.8 - 1.2 tons"
            profit_est = "40,000 - 55,000"
            reason = "Cotton is a premium cash crop that thrives in deep, moisture-retaining black soil during the long Kharif season."

    elif "rabi" in season_lower or req.month.lower() in ["october", "november", "december", "january", "february"]:
        if ("loam" in soil_lower or "clay" in soil_lower) and water_lower in ["moderate", "high"]:
            crop = "Wheat"
            seed = "GW 322 / Lok-1 / HD 2967"
            sowing = "November - December"
            duration = "110 - 125 days"
            fertilizer = "NPK 120:60:40 kg/ha. Apply nitrogen in two split doses (at sowing and first irrigation)."
            irrigation = "Requires 4-6 critical irrigations. Crown Root Initiation (CRI) and Jointing are crucial stages."
            yield_est = "1.8 - 2.2 tons"
            profit_est = "30,000 - 40,000"
            reason = "Wheat requires cool climate, fertile loam or clay soil, and moderate water availability, which is the perfect profile for Rabi farming."
        elif ("sandy" in soil_lower or "loam" in soil_lower) and water_lower in ["low", "moderate"]:
            crop = "Chickpea (Gram)"
            seed = "Vijay / Digvijay / Jaki 9218"
            sowing = "October - November"
            duration = "105 - 115 days"
            fertilizer = "NPK 20:50:20 kg/ha. Seed inoculation with Rhizobium and PSB cultures."
            irrigation = "Low water requirement. Needs only 1-2 irrigations (pre-flowering and pod development)."
            yield_est = "0.7 - 1.0 tons"
            profit_est = "24,000 - 32,000"
            reason = "Chickpea is a cold-season pulse crop that does exceptionally well in loamy soil with minimal water availability."
        else:
            crop = "Mustard"
            seed = "Pusa Bold / Kranti"
            sowing = "October - November"
            duration = "110 - 125 days"
            fertilizer = "NPK 80:40:40 kg/ha. Sulfur application is critical for oil content."
            irrigation = "Requires 2 light irrigations at rosette and pod formation stages."
            yield_est = "0.6 - 0.9 tons"
            profit_est = "26,000 - 34,000"
            reason = "Mustard is highly drought-tolerant, thrives in cool climates, and performs well in sandy/loamy soil with low water inputs."
            
    elif "zaid" in season_lower or req.month.lower() in ["march", "april", "may"]:
        crop = "Moong Bean (Green Gram)"
        seed = "IPM 02-3 / SML 668"
        sowing = "March"
        duration = "60 - 70 days"
        fertilizer = "NPK 20:40:0 kg/ha. Treat seeds with fungicide."
        irrigation = "Requires regular light irrigations every 10-12 days due to summer heat."
        yield_est = "0.4 - 0.6 tons"
        profit_est = "18,000 - 24,000"
        reason = "Moong is a short-duration summer legume crop that restores soil fertility and matches summer temperatures."

    # Multiply estimated yield and profit by farm size
    try:
        y_min, y_max = [float(x.split()[0]) for x in yield_est.split("-")]
        yield_calc = f"{y_min * req.farm_size:.1f} - {y_max * req.farm_size:.1f} tons total"
    except Exception:
        yield_calc = f"{yield_est} (scaling applies)"

    try:
        p_min, p_max = [float(x.replace(",", "").strip()) for x in profit_est.split("-")]
        profit_calc = f"₹{p_min * req.farm_size:,.0f} - ₹{p_max * req.farm_size:,.0f} total"
    except Exception:
        profit_calc = f"₹{profit_est} total"

    return {
        "crop": crop,
        "seed_variety": seed,
        "sowing_month": sowing,
        "harvest_duration": duration,
        "fertilizer_recommendation": fertilizer,
        "irrigation_recommendation": irrigation,
        "estimated_yield": yield_calc,
        "estimated_profit": profit_calc,
        "reason": reason
    }

# Local chatbot knowledge base
LOCAL_QA = {
    "rice": "Rice/Paddy grows best in clayey/clayey-loam soils that retain water well. Recommended varieties are Pusa Basmati 1121 and IR 64. It requires high water availability and constant irrigation. Recommended NPK dosage is 120:60:40 kg/ha.",
    "paddy": "Rice/Paddy grows best in clayey/clayey-loam soils that retain water well. Recommended varieties are Pusa Basmati 1121 and IR 64. It requires high water availability and constant irrigation. Recommended NPK dosage is 120:60:40 kg/ha.",
    "wheat": "Wheat is a Rabi season crop requiring a cool temperature during sowing and warm at harvesting. It thrives in well-drained loamy soils. Popular varieties are GW 322 and Lok-1. Requires moderate water (4-6 irrigations) and NPK ratio of 120:60:40 kg/ha.",
    "cotton": "Cotton is a major cash crop suited for black soils (regur) which have high moisture retention. Best sown in May-June. Bt Cotton is widely used to prevent bollworm. Requires moderate watering; drip irrigation is optimal. Fertilizer needs: NPK 120:60:60 kg/ha.",
    "soybean": "Soybean is a Kharif leguminous crop suited for black cotton soil. Varieties like JS 335 are popular. It has low to moderate water needs and fixes nitrogen in the soil. Recommended NPK is 20:60:40 kg/ha.",
    "mustard": "Mustard is a Rabi crop that thrives in sandy loam soil. Sown in Oct-Nov. It has low water requirements, needing only 2 light irrigations. Sulfur fertilizer is critical for oil content.",
    "chickpea": "Chickpea (Gram) is a Rabi legume sown in Oct-Nov. It thrives in loamy soil with low water availability. It requires only 1-2 irrigations. Best varieties include Vijay and Digvijay.",
    "maize": "Maize (Corn) grows well in sandy-loam soils during Kharif or Rabi. Needs moderate water and good soil drainage. Varieties: Deccan 103. NPK dosage: 100:50:50 kg/ha.",
    "fertilizer": "Standard fertilizer application uses the NPK (Nitrogen, Phosphorus, Potassium) ratio. For grain crops like rice/wheat, use 120:60:40 kg/ha. For pulse/legume crops, use a lower nitrogen ratio (e.g. 20:50:20 kg/ha) as they fix atmospheric nitrogen. Organic options include compost and vermicompost.",
    "irrigation": "Efficient water management is key. Drip irrigation is best for cash crops like cotton and vegetables. Sprinklers are useful for sandy soils. Traditional flood irrigation is suitable for rice but causes water wastage. Try alternate wetting and drying for rice to save water.",
    "scheme": "Major government schemes include PM-KISAN, which gives ₹6,000 per year directly to landowners, and PM Fasal Bima Yojana (PMFBY), which offers low-premium crop insurance against natural calamities. State-specific schemes like Rythu Bandhu (Telangana) and YSR Rythu Bharosa (Andhra Pradesh) also offer direct input subsidies.",
    "pm-kisan": "PM-KISAN provides direct income support of ₹6,000 per year in 3 equal installments of ₹2,000 to all landholding farmer families. You can apply on pmkisan.gov.in using your Aadhaar card and land records.",
    "insurance": "PM Fasal Bima Yojana (PMFBY) is the primary crop insurance scheme. It covers sowing/prevented planting risk, post-harvest losses, and localized calamities. Premium is capped at 1.5% for Rabi, 2.0% for Kharif, and 5% for commercial crops.",
    "weather": "Farming precautions: 1) In case of heavy rain forecasts, ensure proper field drainage to avoid waterlogging. 2) For storm warnings, avoid spraying pesticides and secure greenhouses. 3) For heatwaves, irrigate crops during early morning or evening to reduce evapotranspiration."
}

@app.post("/api/chat")
async def chat_assistant(req: ChatRequest):
    # Fetch API Key from DB first to see if we can use Gemini
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT gemini_api_key FROM settings WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    
    api_key = row["gemini_api_key"] if row else ""
    user_msg = req.message.lower().strip()
    
    # 1. If Gemini API Key is provided, call Gemini API
    if api_key and len(api_key.strip()) > 10:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            
            system_instruction = (
                "You are FarmGenie AI Assistant, an expert agricultural bot. "
                "Answer the user's questions clearly, concisely, and professionally. "
                "Provide advice on crop recommendations, seed varieties, farming practices, "
                "fertilizers, irrigation, weather precautions, and government schemes. "
                "Do NOT talk about being offline, online, or API statuses. Focus strictly on agriculture."
            )
            
            # Format history
            contents = []
            for chat in req.history:
                role_val = "user" if chat.role == "user" else "model"
                contents.append({
                    "role": role_val,
                    "parts": [{"text": chat.content}]
                })
            
            # Add current message
            contents.append({
                "role": "user",
                "parts": [{"text": f"Context/Instruction: {system_instruction}\n\nQuestion: {req.message}"}]
            })
            
            payload = {
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 800,
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=15.0)
                if response.status_code == 200:
                    data = response.json()
                    ai_reply = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {"response": ai_reply}
        except Exception as e:
            # Fall back to local QA if API call fails
            pass
            
    # 2. Local Fallback QA Engine (Keyword matching)
    reply = ""
    for keyword, response_text in LOCAL_QA.items():
        if keyword in user_msg:
            reply += f"• {response_text}\n\n"
            
    if not reply:
        reply = (
            "I am the FarmGenie AI Assistant, your agricultural expert. I can assist you with "
            "crop recommendations, seed varieties, farming practices, fertilizer applications, "
            "irrigation tips, weather precautions, and government schemes.\n\n"
            "Could you please ask a specific question, for example: 'What fertilizer should I use for Rice?' or "
            "'How can I apply for PM-KISAN?'"
        )
    else:
        reply = "Here is what I found based on your question:\n\n" + reply
        
    return {"response": reply}
