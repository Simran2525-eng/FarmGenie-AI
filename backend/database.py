import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "farmgenie.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            state TEXT NOT NULL,
            district TEXT NOT NULL,
            soil_type TEXT NOT NULL,
            water_availability TEXT NOT NULL,
            gemini_api_key TEXT
        )
    """)
    
    # Create schemes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schemes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            benefits TEXT NOT NULL,
            eligibility TEXT NOT NULL,
            required_documents TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            official_website TEXT NOT NULL,
            state TEXT NOT NULL
        )
    """)
    
    # Seed default settings if empty
    cursor.execute("SELECT COUNT(*) FROM settings")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO settings (state, district, soil_type, water_availability, gemini_api_key)
            VALUES (?, ?, ?, ?, ?)
        """, ("Maharashtra", "Pune", "Black Soil", "Moderate", ""))
        
    # Seed schemes if empty
    cursor.execute("SELECT COUNT(*) FROM schemes")
    if cursor.fetchone()[0] == 0:
        sample_schemes = [
            (
                "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                "A central sector scheme to provide income support to all landholding farmers' families across the country to enable them to take care of agricultural expenses.",
                "Direct financial benefit of ₹6,000 per year, paid in three equal installments of ₹2,000 directly into the bank accounts of the farmers.",
                "All landholding farmer families across the country who own cultivable land in their names.",
                "Aadhaar Card, Land ownership documents (7/12 extract or Jamabandi), Bank account details, Mobile number.",
                "2018-12-01",
                "Ongoing",
                "https://pmkisan.gov.in",
                "National"
            ),
            (
                "PM Fasal Bima Yojana (PMFBY)",
                "An government-sponsored crop insurance scheme that integrates multiple stakeholders on a single platform to insure crops against natural calamities, pests, and diseases.",
                "Comprehensive insurance coverage against crop failure. Low premium rates: 2.0% for Kharif, 1.5% for Rabi crops, and 5% for annual commercial/horticultural crops.",
                "All farmers including sharecroppers and tenant farmers growing the notified crops in the notified areas.",
                "Aadhaar Card, Land records, Sowing certificate from local authority, Bank passbook copy, Cancelled cheque.",
                "2016-02-18",
                "Ongoing",
                "https://pmfby.gov.in",
                "National"
            ),
            (
                "Rythu Bandhu Scheme",
                "A welfare program to support farmer's investment for two crops a year by the Government of Telangana. First direct investment support scheme for farmers in India.",
                "Financial assistance of ₹5,000 per acre per season for purchase of inputs like seeds, fertilizers, pesticides, and field preparation costs.",
                "All landowning farmers in the state of Telangana. Tenant farmers are excluded from the current scope.",
                "Pattadar Passbook (land ownership title), Aadhaar Card, Bank passbook details.",
                "2018-05-10",
                "Ongoing",
                "http://rythubandhu.telangana.gov.in",
                "Telangana"
            ),
            (
                "Krishi Bhagya Scheme",
                "A Karnataka state government initiative aimed at improving water conservation and farm productivity in dry-land zones through rainwater harvesting.",
                "Up to 80-90% subsidy for construction of farm ponds (Krishi Honda), polytar lining, diesel pumpsets, and micro-irrigation (drip/sprinkler) equipment.",
                "Farmers residing and owning dry-land agricultural holdings in notified rain-deficient taluks of Karnataka.",
                "Land records (RTC/Pahani), Aadhaar Card, Bank passbook, Passport size photos, Caste certificate (if applicable).",
                "2014-04-01",
                "Ongoing",
                "https://krishibhagya.karnataka.gov.in",
                "Karnataka"
            ),
            (
                "Jalyukt Shivar Abhiyan",
                "A flagship program of the Maharashtra government to make the state drought-free by harvesting rainwater in water-scarce villages.",
                "Government funding for deepening and widening of streams, construction of cement/earth nala plugs, farm ponds, and recharging of dug wells.",
                "Villages and individual farmers located in drought-prone areas or water-deficient zones of Maharashtra.",
                "Land ownership records (7/12 extract), Resident proof, Application through local Gram Panchayat.",
                "2015-01-01",
                "Ongoing",
                "https://mrsac.maharashtra.gov.in",
                "Maharashtra"
            ),
            (
                "YSR Rythu Bharosa",
                "An Andhra Pradesh state government program providing financial assistance to farmers to meet crop cultivation expenses.",
                "Annual financial assistance of ₹13,500 per farmer family, which includes ₹7,500 under Rythu Bharosa and ₹6,000 under PM-KISAN.",
                "Landowner farmer families and SC/ST/BC/Minority tenant farmers in Andhra Pradesh.",
                "Land ownership title deeds, Tenant agreement document (if tenant), Aadhaar Card, Bank account details.",
                "2019-10-15",
                "Ongoing",
                "https://ysrrythubharosa.ap.gov.in",
                "Andhra Pradesh"
            ),
            (
                "Mukhya Mantri Kisan Sahay Yojana",
                "A crop insurance alternative scheme by the Gujarat government to provide assistance to farmers facing crop loss due to drought, heavy rain, or unseasonal rainfall.",
                "Compensation of ₹20,000 per hectare for crop loss between 33% and 60%, and ₹25,000 per hectare for crop loss above 60% (up to a maximum of 4 hectares).",
                "All landholding farmers registered in Gujarat for Kharif crop season.",
                "Aadhaar Card, Land holding records (8-A and 7/12), Bank Account Details, Sowing Declaration.",
                "2020-08-10",
                "Ongoing",
                "https://ikhedut.gujarat.gov.in",
                "Gujarat"
            ),
            (
                "Krishi Kalyan Scheme",
                "A Punjab state government program helping farmers adopt crop diversification, move away from stubble burning, and transition to organic farming.",
                "Subsidies up to 50% for happy seeders, mulchers, rotavators, and organic fertilizers, plus ₹2,500 per acre compensation for avoiding stubble burning.",
                "Active farmers cultivating lands in Punjab who commit to not burning paddy straw.",
                "Land holdings registration, Aadhaar Card, Bank account details, Sowing verification certificate.",
                "2019-09-15",
                "Ongoing",
                "https://agri.punjab.gov.in",
                "Punjab"
            )
        ]
        cursor.executemany("""
            INSERT INTO schemes (name, description, benefits, eligibility, required_documents, start_date, end_date, official_website, state)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_schemes)
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
