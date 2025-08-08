import requests
import json
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
LOGIN_CREDENTIALS = {
    "email": "Test@test.com",
    "password": "test123"
}

def test_timesheet_creation():
    print("🔍 Test de création de timesheet (format mobile)")
    print("=" * 50)
    
    # 1. Test de connexion
    print("\n1️⃣ Test de connexion...")
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
            
            # 2. Simuler la création de timesheet comme l'app mobile
            print("\n2️⃣ Test création timesheet (format mobile)...")
            
            # Générer un code unique comme l'app
            unique_code = str(uuid.uuid4())[:8].upper()
            
            # Créer les détails raccourcis comme l'app mobile
            details = {
                'uid': 1,
                'un': 'test',
                'pid': 5,
                'ts': int(datetime.now().timestamp() * 1000),
                'lat': 48.8566,
                'lng': 2.3522,
            }
            
            details_json = json.dumps(details)
            
            # Données du timesheet
            timesheet_data = {
                'code': unique_code,
                'details': details_json,
                'start': datetime.now().isoformat(),
                'planningId': 5,
                'timesheetTypeId': 1,
            }
            
            print(f"📋 Données envoyées:")
            print(f"   Code: {unique_code}")
            print(f"   PlanningId: 5")
            print(f"   TimesheetTypeId: 1")
            print(f"   Details: {details_json[:100]}...")
            
            # Envoyer la requête
            timesheet_response = requests.post(
                f"{BASE_URL}/Timesheet",
                headers=headers,
                json=timesheet_data
            )
            
            print(f"\n📤 Réponse API:")
            print(f"   Status: {timesheet_response.status_code}")
            print(f"   Body: {timesheet_response.text}")
            
            if timesheet_response.status_code in [200, 201]:
                print("✅ Timesheet créé avec succès!")
            else:
                print("❌ Échec de création du timesheet")
                
        else:
            print(f"❌ Échec de connexion: {login_response.status_code} - {login_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    test_timesheet_creation() 