import requests
import sys

base_url = "http://localhost:8000/api/"

def test_login(username, password):
    url = f"{base_url}token/"
    print(f"Testing login for '{username}' at {url}...")
    try:
        response = requests.post(url, json={"username": username, "password": password})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        if response.status_code == 200:
            print("SUCCESS: Login successful!")
        else:
            print("FAILURE: Login failed.")
    except Exception as e:
        print(f"ERROR: {e}")

def test_reset(username):
    url = f"{base_url}reset-password/"
    print(f"\nTesting reset for '{username}' at {url}...")
    try:
        response = requests.post(url, json={"username": username})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_login("admin", "admin123")
    test_reset("admin")
