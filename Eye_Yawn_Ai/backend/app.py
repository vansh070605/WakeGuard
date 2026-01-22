from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
import base64
import json
from PIL import Image
import io

app = Flask(__name__)

# Load model
model = tf.keras.models.load_model("Improved_Model.h5")

# Load labels
with open("class_labels.json") as f:
    class_labels = json.load(f)

labels = {v: k for k, v in class_labels.items()}

def preprocess_image(img):
    img = img.resize((224, 224))
    img = np.array(img) / 255.0
    img = img.reshape(1, 224, 224, 3)
    return img

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json["image"]

    image_data = base64.b64decode(data.split(",")[1])
    img = Image.open(io.BytesIO(image_data)).convert("RGB")

    img_array = preprocess_image(img)

    preds = model.predict(img_array, verbose=0)
    class_id = int(np.argmax(preds))
    confidence = float(np.max(preds) * 100)

    return jsonify({
    "label": labels[class_id],
    "confidence": round(conf, 2),
    "faces": faces.tolist()
})

if __name__ == "__main__":
    app.run(debug=True)

print(labels[class_id], conf)
