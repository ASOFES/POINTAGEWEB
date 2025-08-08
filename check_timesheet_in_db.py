import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
LOGIN_CREDENTIALS = {
    "email": "Test@test.com",
    "password": "test123"
}

def check_timesheet_in_db():
    print("🔍 Vérification des pointages dans la BD")
    print("=" * 50)
    
    # 1. Connexion
    print("\n1️⃣ Connexion...")
    try:
        login_response = requests.post(
            f"{BASE_URL}/Auth/login",
            json=LOGIN_CREDENTIALS,
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            token = token_data.get('token')
            print(f"✅ Connexion réussie - Token obtenu")
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # 2. Récupérer tous les pointages
            print("\n2️⃣ Récupération de tous les pointages...")
            try:
                timesheets_response = requests.get(f"{BASE_URL}/Timesheet", headers=headers)
                print(f"Status: {timesheets_response.status_code}")
                if timesheets_response.status_code == 200:
                    timesheets_data = timesheets_response.json()
                    print(f"Nombre total de pointages: {len(timesheets_data)}")
                    
                    # Afficher les 5 derniers pointages
                    recent_timesheets = timesheets_data[-5:] if len(timesheets_data) > 5 else timesheets_data
                    print(f"\n📋 5 derniers pointages:")
                    for i, timesheet in enumerate(recent_timesheets, 1):
                        print(f"\n{i}. Pointage ID: {timesheet.get('id', 'N/A')}")
                        print(f"   Code: {timesheet.get('code', 'N/A')}")
                        print(f"   Start: {timesheet.get('start', 'N/A')}")
                        print(f"   PlanningId: {timesheet.get('planningId', 'N/A')}")
                        print(f"   TimesheetTypeId: {timesheet.get('timesheetTypeId', 'N/A')}")
                        print(f"   Details: {timesheet.get('details', 'N/A')[:100]}...")
                else:
                    print(f"❌ Erreur: {timesheets_response.text}")
            except Exception as e:
                print(f"❌ Erreur lors de la récupération des pointages: {e}")
            
            # 3. Vérifier les pointages de l'employé JACKSON (ID: 202)
            print("\n3️⃣ Pointages de l'employé JACKSON (ID: 202)...")
            try:
                employee_timesheets_response = requests.get(
                    f"{BASE_URL}/Timesheet/DailyResume/UserId/202", 
                    headers=headers
                )
                print(f"Status: {employee_timesheets_response.status_code}")
                if employee_timesheets_response.status_code == 200:
                    employee_timesheets = employee_timesheets_response.json()
                    print(f"Nombre de pointages pour JACKSON: {len(employee_timesheets) if isinstance(employee_timesheets, list) else 1}")
                    
                    if isinstance(employee_timesheets, list):
                        for i, timesheet in enumerate(employee_timesheets, 1):
                            print(f"\n{i}. Pointage JACKSON:")
                            print(f"   Code: {timesheet.get('code', 'N/A')}")
                            print(f"   Start: {timesheet.get('start', 'N/A')}")
                            print(f"   Details: {timesheet.get('details', 'N/A')[:100]}...")
                    else:
                        print(f"Pointage unique: {json.dumps(employee_timesheets, indent=2)}")
                else:
                    print(f"❌ Erreur: {employee_timesheets_response.text}")
            except Exception as e:
                print(f"❌ Erreur lors de la vérification des pointages employé: {e}")
            
            # 4. Vérifier les pointages récents (aujourd'hui)
            print("\n4️⃣ Pointages récents (aujourd'hui)...")
            try:
                today = datetime.now().strftime("%Y-%m-%d")
                print(f"Date de recherche: {today}")
                
                # Chercher les pointages avec le code TEST123 ou similaires
                if 'timesheets_data' in locals():
                    recent_timesheets = [t for t in timesheets_data if 'TEST' in str(t.get('code', ''))]
                    print(f"Pointages avec code TEST: {len(recent_timesheets)}")
                    for timesheet in recent_timesheets:
                        print(f"   Code: {timesheet.get('code')} - Start: {timesheet.get('start')}")
                
            except Exception as e:
                print(f"❌ Erreur lors de la vérification des pointages récents: {e}")
                
        else:
            print(f"❌ Échec de connexion: {login_response.status_code} - {login_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    check_timesheet_in_db() 