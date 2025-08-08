import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
LOGIN_CREDENTIALS = {
    "email": "admin@test.com",
    "password": "admin123"
}

def test_vercel_qr_format():
    print("🔍 Test du format QR code Vercel")
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
            
            # 2. Simuler le format QR code Vercel
            print("\n2️⃣ Test format Vercel (site + employé + expiration)...")
            current_time = datetime.now().isoformat()
            vercel_format = {
                'code': 'VERCEL_TEST',
                'details': f'{{"siteId":1,"planningId":5,"timesheetTypeId":2,"siteName":"HQ","employeeId":202,"timestamp":"{current_time}","validUntil":"{current_time}"}}',
                'start': current_time,
                'planningId': 5,
                'timesheetTypeId': 2,
            }
            
            print(f"QR Code Vercel simulé:")
            print(f"   Details: {vercel_format['details']}")
            print(f"   Longueur: {len(vercel_format['details'])} caractères")
            
            vercel_response = requests.post(
                f"{BASE_URL}/Timesheet",
                headers=headers,
                json=vercel_format
            )
            
            print(f"Status Vercel: {vercel_response.status_code}")
            if vercel_response.status_code in [200, 201]:
                print("✅ Format Vercel fonctionne")
                print(f"Réponse: {vercel_response.text}")
            else:
                print(f"❌ Erreur Vercel: {vercel_response.text}")
            
            # 3. Analyser les différences
            print("\n3️⃣ Comparaison des formats...")
            print("Format Vercel (site + employé):")
            print(f"   Contenu: {vercel_format['details']}")
            print(f"   Caractéristiques: siteId, planningId, timesheetTypeId, employeeId, timestamp")
            
            print("\nFormat localhost (générique):")
            localhost_details = '{"siteId":1,"planningId":5,"timesheetTypeId":2,"siteName":"HQ","timestamp":"2025-07-30T23:00:24.088","validUntil":"2025-07-31T07:00:24.088"}'
            print(f"   Contenu: {localhost_details}")
            print(f"   Caractéristiques: siteId, planningId, timesheetTypeId, siteName, timestamp")
                
        else:
            print(f"❌ Échec de connexion: {login_response.status_code} - {login_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    test_vercel_qr_format() 