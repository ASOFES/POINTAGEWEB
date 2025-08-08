import requests
import json

# Configuration
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
LOGIN_CREDENTIALS = {
    "email": "Test@test.com",
    "password": "test123"
}

def test_employee_access():
    print("🔍 Test d'accès aux employés avec Test@test.com")
    print("=" * 50)
    
    # 1. Connexion avec Test@test.com
    print("\n1️⃣ Connexion avec Test@test.com...")
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
            
            # 2. Tester l'accès à un employé spécifique
            print("\n2️⃣ Test accès employé JACKSON (ID: 202)...")
            try:
                employee_response = requests.get(f"{BASE_URL}/Employee/202", headers=headers)
                print(f"Status: {employee_response.status_code}")
                if employee_response.status_code == 200:
                    employee_data = employee_response.json()
                    print(f"✅ Accès réussi à l'employé:")
                    print(f"   Nom: {employee_data.get('firstName', '')} {employee_data.get('lastName', '')}")
                    print(f"   Email: {employee_data.get('personalEmail', '')}")
                    print(f"   Sites: {employee_data.get('sites', [])}")
                else:
                    print(f"❌ Erreur: {employee_response.text}")
            except Exception as e:
                print(f"❌ Erreur lors du test employé: {e}")
            
            # 3. Tester l'accès à l'employé BENNY
            print("\n3️⃣ Test accès employé BENNY (ID: 203)...")
            try:
                employee_response = requests.get(f"{BASE_URL}/Employee/203", headers=headers)
                print(f"Status: {employee_response.status_code}")
                if employee_response.status_code == 200:
                    employee_data = employee_response.json()
                    print(f"✅ Accès réussi à l'employé:")
                    print(f"   Nom: {employee_data.get('firstName', '')} {employee_data.get('lastName', '')}")
                    print(f"   Email: {employee_data.get('personalEmail', '')}")
                    print(f"   Sites: {employee_data.get('sites', [])}")
                else:
                    print(f"❌ Erreur: {employee_response.text}")
            except Exception as e:
                print(f"❌ Erreur lors du test employé: {e}")
            
            # 4. Tester la création de timesheet pour un employé
            print("\n4️⃣ Test création timesheet pour employé...")
            try:
                timesheet_data = {
                    'code': 'TEST123',
                    'details': '{"uid":202,"un":"JACKSON","pid":1,"ts":1753903904783,"lat":48.8566,"lng":2.3522}',
                    'start': '2025-07-30T22:30:00Z',
                    'planningId': 1,
                    'timesheetTypeId': 1,
                }
                
                timesheet_response = requests.post(
                    f"{BASE_URL}/Timesheet",
                    headers=headers,
                    json=timesheet_data
                )
                
                print(f"Status: {timesheet_response.status_code}")
                if timesheet_response.status_code in [200, 201]:
                    print(f"✅ Timesheet créé avec succès!")
                    print(f"Réponse: {timesheet_response.text}")
                else:
                    print(f"❌ Erreur création timesheet: {timesheet_response.text}")
            except Exception as e:
                print(f"❌ Erreur lors du test timesheet: {e}")
                
        else:
            print(f"❌ Échec de connexion: {login_response.status_code} - {login_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    test_employee_access() 