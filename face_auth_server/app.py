from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import os
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/coursesell'))
db = client.coursesell
users = db.users

# Load the face detection cascade classifier
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def process_base64_image(base64_string):
    """Convert base64 image to numpy array"""
    try:
        # Remove data URL prefix if present
        if 'data:image' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 string to bytes
        image_bytes = np.frombuffer(base64.b64decode(base64_string), dtype=np.uint8)
        
        # Decode image array
        image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)
        return image
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return None

def detect_and_process_face(image):
    """Detect face in image and return processed face image"""
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return None
        
        # Get the largest face
        largest_face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = largest_face
        
        # Extract and resize face to standard size
        face_img = gray[y:y+h, x:x+w]
        face_img = cv2.resize(face_img, (128, 128))
        
        # Normalize pixel values
        face_img = face_img.astype(np.float32) / 255.0
        
        return face_img.flatten()
    except Exception as e:
        print(f"Error detecting face: {str(e)}")
        return None

def compare_faces(face1, face2, threshold=0.8):
    """Compare two face vectors using correlation coefficient"""
    try:
        correlation = np.corrcoef(face1, face2)[0, 1]
        return correlation > threshold
    except Exception as e:
        print(f"Error comparing faces: {str(e)}")
        return False

@app.route('/api/face-auth/register', methods=['POST'])
def register_face():
    """Register a user's face"""
    try:
        data = request.json
        user_id = data.get('userId')
        image_base64 = data.get('image')

        if not user_id or not image_base64:
            return jsonify({'error': 'Missing required data'}), 400

        # Convert string ID to ObjectId
        try:
            object_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID format'}), 400

        # Verify user exists and is a regular user
        user = users.find_one({'_id': object_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if user.get('role') != 'user':
            return jsonify({'error': 'Face authentication is only available for users'}), 403

        # Process the image
        image = process_base64_image(image_base64)
        if image is None:
            return jsonify({'error': 'Invalid image data'}), 400

        # Detect and process face
        face_vector = detect_and_process_face(image)
        if face_vector is None:
            return jsonify({'error': 'No face detected in image'}), 400

        # Store face vector in MongoDB
        result = users.update_one(
            {'_id': object_id},
            {
                '$set': {
                    'faceVector': face_vector.tolist(),
                    'hasFaceId': True
                }
            }
        )

        if result.modified_count == 0:
            return jsonify({'error': 'Failed to update user'}), 500

        return jsonify({
            'message': 'Face registered successfully',
            'hasFaceId': True
        })

    except Exception as e:
        print(f"Error in face registration: {str(e)}")
        return jsonify({'error': 'Face registration failed'}), 500

@app.route('/api/face-auth/verify', methods=['POST'])
def verify_face():
    """Verify a user's face"""
    try:
        data = request.json
        user_id = data.get('userId')
        image_base64 = data.get('image')

        if not user_id or not image_base64:
            return jsonify({'error': 'Missing required data'}), 400

        # Convert string ID to ObjectId
        try:
            object_id = ObjectId(user_id)
        except:
            return jsonify({'error': 'Invalid user ID format'}), 400

        # Get user from database
        user = users.find_one({'_id': object_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if user.get('role') != 'user':
            return jsonify({'error': 'Face authentication is only available for users'}), 403
        if not user.get('faceVector'):
            return jsonify({'error': 'No registered face found'}), 404

        # Process the verification image
        image = process_base64_image(image_base64)
        if image is None:
            return jsonify({'error': 'Invalid image data'}), 400

        # Detect and process face
        face_vector = detect_and_process_face(image)
        if face_vector is None:
            return jsonify({'error': 'No face detected in verification image'}), 400

        # Compare faces
        stored_vector = np.array(user['faceVector'])
        if compare_faces(stored_vector, face_vector):
            return jsonify({
                'message': 'Face verification successful',
                'userId': str(user['_id']),
                'role': user['role']
            })
        else:
            return jsonify({'error': 'Face verification failed'}), 401

    except Exception as e:
        print(f"Error in face verification: {str(e)}")
        return jsonify({'error': 'Face verification failed'}), 500

@app.route('/api/face-auth/check-registration', methods=['GET'])
def check_face_registration():
    """Check if a user has registered their face"""
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        user = users.find_one({'_id': user_id})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'hasFaceId': bool(user.get('hasFaceId', False)),
            'role': user.get('role')
        })

    except Exception as e:
        print(f"Error checking face registration: {str(e)}")
        return jsonify({'error': 'Failed to check face registration'}), 500

@app.route('/api/face-auth/test', methods=['GET'])
def test_connection():
    """Test if the face authentication server is running"""
    return jsonify({'message': 'Face authentication server is running'})

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True) 