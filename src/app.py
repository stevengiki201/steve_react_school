# backend/app.py
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow React frontend to communicate

# In-memory "database"
users = []

# Register user
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    if any(u['username'] == data["username"] for u in users):
        return jsonify({"message": "Username already exists"}), 400
    hashed_password = generate_password_hash(data["password"])
    user = {
        "username": data["username"],
        "password": hashed_password,
        "role": data["role"]  # teacher or student
    }
    users.append(user)
    return jsonify({"message": "User registered successfully"})

# Login user
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    for user in users:
        if user["username"] == data["username"] and check_password_hash(user["password"], data["password"]):
            return jsonify({"message": "Login successful", "role": user["role"]})
    return jsonify({"message": "Invalid credentials"}), 401

if __name__ == "__main__":
    app.run(debug=True)
