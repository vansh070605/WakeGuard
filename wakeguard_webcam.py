import cv2
import numpy as np
import tensorflow as tf
from collections import deque
import time

# Load model
model = tf.keras.models.load_model("wakeguard_model.h5")

# Class labels (VERY IMPORTANT)
class_labels = {
    0: "Closed",
    1: "Open",
    2: "No Yawn",
    3: "Yawn"
}

IMG_SIZE = 224

# Eye closed tracking
closed_frames = 0
CLOSED_THRESHOLD = 30  # ~1 second (30 FPS)

cap = cv2.VideoCapture(0)

print("🚗 WakeGuard started. Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    resized = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))
    normalized = resized / 255.0
    input_data = np.expand_dims(normalized, axis=0)

    preds = model.predict(input_data, verbose=0)
    class_id = np.argmax(preds)
    confidence = np.max(preds)

    label = class_labels[class_id]

    # Eye closure logic
    if label == "Closed":
        closed_frames += 1
    else:
        closed_frames = 0

    status = "AWAKE"

    if closed_frames > CLOSED_THRESHOLD or label == "Yawn":
        status = "DROWSY"

    # Display
    cv2.putText(frame, f"State: {label} ({confidence*100:.1f}%)",
                (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    cv2.putText(frame, f"Status: {status}",
                (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 1,
                (0, 0, 255) if status == "DROWSY" else (0, 255, 0), 3)

    cv2.imshow("WakeGuard - Driver Monitor", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
