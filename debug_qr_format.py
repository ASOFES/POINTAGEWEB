import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://timesheetapp.azurewebsites.net/api"
LOGIN_CREDENTIALS = {
    "email": "admin@test.com",
    "password": "admin123"
}

def debug_qr_format():
    print("🔍 Debug du format QR code Vercel")
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
            
            # 2. Simuler le format exact Vercel
            print("\n2️⃣ Format QR code Vercel exact...")
            
            # Format exact basé sur votre exemple
            vercel_exact_format = {
                "userId": 2,
                "userName": "test",
                "planningId": 5,
                "timestamp": "2025-07-30T22:05:45.655Z",
                "location": {
                    "latitude": -11.6703745,
                    "longitude": 27.484246999999996
                },
                "timeSheetId": 21622,
                "timeSheetTypeId": 2
            }
            
            print("Format Vercel exact:")
            print(f"   JSON: {json.dumps(vercel_exact_format, indent=2)}")
            print(f"   Longueur: {len(json.dumps(vercel_exact_format))} caractères")
            
            # 3. Tester avec l'API
            print("\n3️⃣ Test avec l'API...")
            test_data = {
                'code': 'VERCEL_EXACT_TEST',
                'details': json.dumps(vercel_exact_format),
                'start': datetime.now().isoformat(),
                'planningId': 5,
                'timesheetTypeId': 2,
            }
            
            test_response = requests.post(
                f"{BASE_URL}/Timesheet",
                headers=headers,
                json=test_data
            )
            
            print(f"Status: {test_response.status_code}")
            if test_response.status_code in [200, 201]:
                print("✅ Format exact fonctionne avec l'API")
                print(f"Réponse: {test_response.text}")
            else:
                print(f"❌ Erreur: {test_response.text}")
            
            # 4. Instructions pour capturer un vrai QR
            print("\n4️⃣ Instructions pour capturer un vrai QR:")
            print("1. Allez sur https://timesheet-web-app.vercel.app/qr")
            print("2. Connectez-vous avec admin@test.com / admin123")
            print("3. Sélectionnez un site et un employé")
            print("4. Générez le QR code")
            print("5. Scannez avec une app QR scanner")
            print("6. Copiez le contenu JSON ici")
            print("\nFormat attendu:")
            print(json.dumps(vercel_exact_format, indent=2))
                
        else:
            print(f"❌ Échec de connexion: {login_response.status_code} - {login_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur générale: {e}")

if __name__ == "__main__":
    debug_qr_format() 