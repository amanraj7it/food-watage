from flask import Flask, request, jsonify #type: ignore
from flask_cors import CORS #type: ignore
import json
import os
import random
import time
from threading import Timer
import string

app = Flask(__name__)
CORS(app)

DB_FILE = os.path.join(os.path.dirname(__file__), 'database.json')

def load_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {"users": [], "donations": []}

def save_db(db):
    try:
        with open(DB_FILE, 'w') as f:
            json.dump(db, f, indent=2)
    except Exception as e:
        print("Error saving DB:", e)

otps = {}

def delete_otp(email):
    if email in otps:
        del otps[email]

import socket
import ssl
import base64

def send_raw_socket_email(to_email, subject, body_text, smtp_server, smtp_port, sender_email, sender_pass):
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.settimeout(10)
    client_socket.connect((smtp_server, smtp_port))
    recv = client_socket.recv(1024).decode()
    if '220' not in recv:
        raise Exception('220 reply not received from server.')

    client_socket.send(b'EHLO server\r\n')
    client_socket.recv(1024)

    client_socket.send(b'STARTTLS\r\n')
    recv2 = client_socket.recv(1024).decode()
    if '220' not in recv2:
        raise Exception('TLS not supported by server.')

    context = ssl.create_default_context()
    tls_socket = context.wrap_socket(client_socket, server_hostname=smtp_server)

    tls_socket.send(b'EHLO server\r\n')
    tls_socket.recv(1024)

    tls_socket.send(b'AUTH LOGIN\r\n')
    tls_socket.recv(1024)
    tls_socket.send(base64.b64encode(sender_email.encode()) + b'\r\n')
    tls_socket.recv(1024)
    tls_socket.send(base64.b64encode(sender_pass.encode()) + b'\r\n')
    recv_auth = tls_socket.recv(1024).decode()
    if '235' not in recv_auth:
        raise Exception(f'Auth failed: {recv_auth}')

    tls_socket.send(f'MAIL FROM: <{sender_email}>\r\n'.encode())
    tls_socket.recv(1024)
    
    tls_socket.send(f'RCPT TO: <{to_email}>\r\n'.encode())
    tls_socket.recv(1024)

    tls_socket.send(b'DATA\r\n')
    tls_socket.recv(1024)

    msg = (f"Subject: {subject}\r\n"
           f"From: Harvest Network <{sender_email}>\r\n"
           f"To: {to_email}\r\n\r\n"
           f"{body_text}\r\n.\r\n")
    tls_socket.send(msg.encode())
    tls_socket.recv(1024)

    tls_socket.send(b'QUIT\r\n')
    tls_socket.close()

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    mode = data.get('mode')
    if not email:
        return jsonify({"error": "Email required"}), 400

    db = load_db()
    existing_user = next((u for u in db['users'] if u.get('email', '').strip().lower() == email.lower()), None)
    if mode == 'register' and existing_user:
        return jsonify({
            "ok": False,
            "error": f"Email is already registered as a {existing_user.get('role', 'user').upper()}. Each email is linked to one role. Please log in."
        }), 400
    if mode == 'forgot' and not existing_user:
        return jsonify({
            "ok": False,
            "error": "No account found with this email address. Please register first."
        }), 404

    otp_code = str(random.randint(1000, 9999))
    otps[email] = otp_code

    # Set it to expire in 5 mins
    Timer(300, delete_otp, args=(email,)).start()

    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    sender_email = os.environ.get('SMTP_EMAIL', 'amanbrilliant7@gmail.com')
    sender_pass = os.environ.get('SMTP_PASS', 'ekbf alhp fmxj knds')

    try:
        if sender_pass != 'your_password':
            subject = 'Harvest Network - Your Verification Code'
            body = f"Your secure 4-digit verification code is: {otp_code}\n\nThis code will expire in 5 minutes."
            send_raw_socket_email(email, subject, body, smtp_server, smtp_port, sender_email, sender_pass)
            print(f"[RAW SOCKET] OTP successfully sent to {email}")
        else:
            print("===============================")
            print(f"[DUMMY MODE OTP] Sent to {email}: {otp_code}")
            print("To send raw socket emails, set SMTP_EMAIL and SMTP_PASS env variables.")
            print("===============================")
                
        return jsonify({"ok": True, "message": "OTP sent successfully"})
    except Exception as e:
        print(f"Failed to send email via RAW socket: {e}")
        return jsonify({"ok": False, "error": "Internal SMTP server error. Please check server logs."}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password')
    
    db = load_db()
    user = next((u for u in db['users'] if u.get('email', '').strip().lower() == email.lower() and u.get('password') == password), None)

    if user:
        if user.get('status') == 'banned':
            return jsonify({"success": False, "message": "Your account has been banned by the Admin."})
        return jsonify({"success": True, "user": user})
    else:
        return jsonify({"success": False, "message": "Invalid email or password."})

def generate_id():
    # Simple base36 string mimicking Date.now().toString(36)
    timestamp = str(int(time.time() * 1000))
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=8)) + timestamp

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    code = data.get('code')
    name = data.get('name')
    password = data.get('password')
    role = data.get('role')

    if email not in otps:
        return jsonify({"success": False, "message": "OTP expired or not sent"})

    if otps.get(email) == str(code):
        del otps[email]

        db = load_db()
        existing_user = next((u for u in db['users'] if u.get('email', '').strip().lower() == email.lower()), None)
        
        if existing_user:
            return jsonify({
                "success": False,
                "message": f"Email already registered as {existing_user.get('role', 'user').upper()}. Please log in."
            }), 400

        import datetime
        user = {
            "id": generate_id(),
            "name": name,
            "email": email,
            "password": password,
            "role": role or 'donor',
            "status": "active",
            "createdAt": datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.000Z')
        }
        db['users'].append(user)
        save_db(db)

        return jsonify({"success": True, "user": user})
    
    return jsonify({"success": False, "message": "Incorrect OTP"})

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('newPassword')

    if email not in otps:
        return jsonify({"success": False, "message": "OTP expired or not sent"})

    if otps.get(email) == str(code):
        del otps[email]

        db = load_db()
        user = next((u for u in db['users'] if u.get('email') == email), None)
        if user:
            user['password'] = new_password
            save_db(db)
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "message": "Account not found"})
            
    return jsonify({"success": False, "message": "Incorrect OTP"})

@app.route('/api/users', methods=['GET', 'POST'])
def handle_users():
    db = load_db()
    if request.method == 'GET':
        return jsonify({"value": json.dumps(db['users'])})
    elif request.method == 'POST':
        data = request.get_json() or {}
        try:
            db['users'] = json.loads(data.get('value', '[]'))
            save_db(db)
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"ok": False, "error": str(e)}), 400

@app.route('/api/donations', methods=['GET', 'POST'])
def handle_donations():
    db = load_db()
    if request.method == 'GET':
        return jsonify({"value": json.dumps(db['donations'])})
    elif request.method == 'POST':
        data = request.get_json() or {}
        try:
            db['donations'] = json.loads(data.get('value', '[]'))
            save_db(db)
            return jsonify({"ok": True})
        except Exception as e:
            return jsonify({"ok": False, "error": str(e)}), 400

@app.route('/api/send-email', methods=['POST'])
def send_email():
    data = request.get_json() or {}
    to_email = data.get('to_email')
    subject = data.get('subject')
    body = data.get('body')

    if not to_email or not subject or not body:
        return jsonify({"error": "Missing required fields"}), 400

    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    sender_email = os.environ.get('SMTP_EMAIL', 'amanbrilliant7@gmail.com') # Fallback as provided manually
    sender_pass = os.environ.get('SMTP_PASS', 'ekbf alhp fmxj knds')

    try:
        if sender_pass != 'your_password':
            send_raw_socket_email(to_email, subject, body, smtp_server, smtp_port, sender_email, sender_pass)
            print(f"[RAW SOCKET] Generic email successfully sent to {to_email}")
        else:
            print("===============================")
            print(f"[DUMMY MODE EMAIL] Sent to {to_email}")
            print(f"Subject: {subject}")
            print("===============================")
        return jsonify({"ok": True})
    except Exception as e:
        print(f"Failed to send email via RAW socket: {e}")
        return jsonify({"ok": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 4321))
    print(f"Flask JSON Database server running on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
