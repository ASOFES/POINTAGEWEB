import requests
import json

# Configuration
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
LOGIN_CREDENTIALS = {
    "email": "admin@test.com",
    "password": "admin123"
}

def test_qr_formats():
    print("🔍 Comparaison des formats QR codes")
    print("=" * 50)
    
    # 1. Connexion avec admin@test.com
    print("\n1️⃣ Connexion avec admin@test.com...")
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
            
            # 2. Tester la création de timesheet avec format localhost
            print("\n2️⃣ Test format localhost...")
            localhost_format = {
                'code': 'TEST_LOCALHOST',
                'details': '{"siteId":1,"planningId":5,"timesheetTypeId":2,"siteName":"HQ","timestamp":"2025-07-30T23:00:24.088","validUntil":"2025-07-31T07:00:24.088"}',
                'start': '2025-07-30T23:00:24.088',
                'planningId': 5,
                'timesheetTypeId': 2,
            }
            
            localhost_response = requests.post(
                f"{BASE_URL}/Timesheet",
                headers=headers,
                json=localhost_format
            )
            
            print(f"Status localhost: {localhost_response.status_code}")
            if localhost_response.status_code in [200, 201]:
                print("✅ Format localhost fonctionne")
            else:
                print(f"❌ Erreur localhost: {localhost_response.text}")
            
            # 3. Tester avec format raccourci (comme notre app)
            print("\n3️⃣ Test format raccourci (notre app)...")
            short_format = {
                'code': 'TEST_SHORT',
                'details': '{"uid":202,"un":"JACKSON","pid":5,"ts":1753909294151,"lat":-11.6704419,"lng":27.4838}',
                'start': '2025-07-30T23:00:24.088',
                'planningId': 5,
                'timesheetTypeId': 2,
            }
            
            short_response = requests.post(
                f"{BASE_URL}/Timesheet",
                headers=headers,
                json=short_format
            )
            
            print(f"Status raccourci: {short_response.status_code}")
            if short_response.status_code in [200, 201]:
                print("✅ Format raccourci fonctionne")
            else:
                print(f"❌ Erreur raccourci: {short_response.text}")
            
            # 4. Analyser les différences
            print("\n4️⃣ Analyse des formats...")
            print("Format localhost (fonctionne):")
            print(f"   Longueur details: {len(localhost_format['details'])} caractères")
            print(f"   Contenu: {localhost_format['details']}")
            
            print("\nFormat raccourci (notre app):")
            print(f"   Longueur details: {len(short_format['details'])} caractères")
            print(f"   Contenu: {short_format['details']}")
                
        else:
            print(f"❌ Échec de connexion: {login_response.status_code} - {login_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    test_qr_formats() 