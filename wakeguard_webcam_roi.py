import cv2
import numpy as np
import tensorflow as tf
import time

# Load trained model
model = tf.keras.models.load_model("wakeguard_model.h5")

# Class mapping (LOCKED)
class_labels = {
    0: "Closed",
    1: "Open",
    2: "No Yawn",
    3: "Yawn"
}

IMG_SIZE = 224
CLOSED_THRESHOLD = 30
closed_frames = 0

# Load face detector
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

cap = cv2.VideoCapture(0)
print("🚗 WakeGuard ROI mode started. Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.3, minNeighbors=5
    )

    label = "No Face"
    confidence = 0
    status = "AWAKE"

    for (x, y, w, h) in faces:
        # Draw face box
        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)

        # ROI: upper face (eyes + mouth)
        roi = frame[y:y+int(0.7*h), x:x+w]

        if roi.size == 0:
            continue

        roi_resized = cv2.resize(roi, (IMG_SIZE, IMG_SIZE))
        roi_normalized = roi_resized / 255.0
        roi_input = np.expand_dims(roi_normalized, axis=0)

        preds = model.predict(roi_input, verbose=0)
        class_id = np.argmax(preds)
        confidence = np.max(preds)

        label = class_labels[class_id]

        # Drowsiness logic
        if label == "Closed":
            closed_frames += 1
        else:
            closed_frames = 0

        if closed_frames > CLOSED_THRESHOLD or label == "Yawn":
            status = "DROWSY"

        break  # only first face

    # Display info
    cv2.putText(frame, f"State: {label} ({confidence*100:.1f}%)",
                (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    cv2.putText(frame, f"Status: {status}",
                (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 1,
                (0, 0, 255) if status == "DROWSY" else (0, 255, 0), 3)

    cv2.imshow("WakeGuard - ROI Mode", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
