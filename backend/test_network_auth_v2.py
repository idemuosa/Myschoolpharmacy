import urllib.request
import json
import socket

base_url = "http://localhost:8000/api/"

def test_api(endpoint, data=None):
    url = f"{base_url}{endpoint}"
    print(f"Testing {url}...")
    try:
        req = urllib.request.Request(url, method='POST')
        req.add_header('Content-Type', 'application/json')
        jsondata = json.dumps(data).encode('utf-8')
        
        with urllib.request.urlopen(req, data=jsondata, timeout=5) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Status: {status}")
            print(f"Body: {body}")
            return status, body
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return e.code, None
    except Exception as e:
        print(f"Connection Error: {e}")
        return None, None

if __name__ == "__main__":
    print("--- AUTHENTICATION NETWORK TEST ---")
    test_api("token/", {"username": "admin", "password": "admin123"})
    test_api("reset-password/", {"username": "admin"})
    print("--- END TEST ---")
