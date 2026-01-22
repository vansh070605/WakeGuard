import streamlit as st
import cv2
import numpy as np
import tensorflow as tf

# ------------------ PAGE CONFIG ------------------
st.set_page_config(page_title="WakeGuard", layout="centered")

# ------------------ LOAD BINARY EYE MODEL ------------------
eye_model = tf.keras.models.load_model("wakeguard_eye_model.keras")

IMG_SIZE = 224

# ------------------ THRESHOLDS ------------------
CLOSED_THRESHOLD = 60      # ~2 seconds
EYE_CLOSED_PROB = 0.7      # sigmoid threshold

# ------------------ SESSION STATE ------------------
if "run_camera" not in st.session_state:
    st.session_state.run_camera = False

if "closed_frames" not in st.session_state:
    st.session_state.closed_frames = 0

# ------------------ FACE DETECTOR ------------------
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# ------------------ UI ------------------
st.title("🚗 WakeGuard")
st.subheader("Real-Time Driver Drowsiness Detection")

col1, col2 = st.columns(2)

with col1:
    if st.button("▶ Start Camera"):
        st.session_state.run_camera = True
        st.session_state.closed_frames = 0

with col2:
    if st.button("⏹ Stop Camera"):
        st.session_state.run_camera = False

frame_placeholder = st.empty()
status_placeholder = st.empty()

# ------------------ CAMERA LOOP ------------------
if st.session_state.run_camera:
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    while st.session_state.run_camera and cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        eye_state = "No Face"
        status = "AWAKE"

        for (x, y, w, h) in faces:
            # 👁️ EYE-ONLY ROI (TOP 25%)
            eye_roi = frame[y:y + int(0.25 * h), x:x + w]

            if eye_roi.size == 0:
                continue

            eye_roi = cv2.resize(eye_roi, (IMG_SIZE, IMG_SIZE))
            eye_roi = eye_roi / 255.0
            eye_roi = np.expand_dims(eye_roi, axis=0)

            # 🔮 Predict eye state
            prob_closed = eye_model.predict(eye_roi, verbose=0)[0][0]

            if prob_closed > EYE_CLOSED_PROB:
                eye_state = "Closed"
                st.session_state.closed_frames += 1
            else:
                eye_state = "Open"
                st.session_state.closed_frames = 0

            if st.session_state.closed_frames >= CLOSED_THRESHOLD:
                status = "DROWSY"

            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
            break

        # ------------------ DISPLAY ------------------
        cv2.putText(frame, f"Eye State: {eye_state}",
                    (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0, 255, 0), 2)

        cv2.putText(frame, f"Status: {status}",
                    (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.2,
                    (0, 0, 255) if status == "DROWSY" else (0, 255, 0), 3)

        frame_placeholder.image(frame, channels="BGR")
        status_placeholder.markdown(
            f"### 🚦 Current Status: **{status}**"
        )

    cap.release()
