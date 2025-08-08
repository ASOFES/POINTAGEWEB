import requests
import json

# Configuration
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
LOGIN_CREDENTIALS = {
    "email": "Test@test.com",
    "password": "test123"
}

def test_timesheet_endpoints():
    print("🔍 Test de la structure des réponses API Timesheet")
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
            
            # 2. Test endpoint /Timesheet/DailyResume/UserId/1
            print("\n2️⃣ Test endpoint /Timesheet/DailyResume/UserId/1...")
            try:
                timesheet_response = requests.get(
                    f"{BASE_URL}/Timesheet/DailyResume/UserId/1", 
                    headers=headers
                )
                print(f"Status: {timesheet_response.status_code}")
                if timesheet_response.status_code == 200:
                    timesheet_data = timesheet_response.json()
                    print(f"Type de réponse: {type(timesheet_data)}")
                    print(f"Contenu: {json.dumps(timesheet_data, indent=2)}")
                else:
                    print(f"❌ Erreur: {timesheet_response.text}")
            except Exception as e:
                print(f"❌ Erreur lors du test Timesheet: {e}")
                
        else:
            print(f"❌ Échec de connexion: {login_response.status_code} - {login_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    test_timesheet_endpoints() 