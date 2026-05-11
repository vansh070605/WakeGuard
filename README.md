# WakeGuard

WakeGuard is an AI-powered driver drowsiness and yawn detection system designed to improve road safety using Computer Vision and Machine Learning. The project analyzes real-time facial and eye movement patterns to detect signs of fatigue and trigger alerts before accidents occur.

## Features

* Real-time eye tracking and blink detection
* Yawn detection using facial landmarks
* Driver drowsiness monitoring system
* Live webcam-based analysis
* AI-powered fatigue detection
* Alert system for unsafe driving conditions
* Frontend interface for monitoring and interaction

## Tech Stack

### AI / ML

* Python
* OpenCV
* MediaPipe / Facial Landmark Detection
* Jupyter Notebook

### Frontend

* HTML
* CSS
* JavaScript

## Project Structure

```bash
WakeGuard/
│── Eye_Yawn_Ai/
│── frontend/
│── models/
│── static/
│── templates/
│── app.py
│── requirements.txt
│── README.md
```

## How It Works

1. The webcam captures live video input.
2. Facial landmarks are detected in real time.
3. Eye aspect ratio (EAR) and yawn patterns are analyzed.
4. If fatigue or drowsiness is detected, the system triggers an alert.
5. The frontend displays live monitoring results.

## Installation

### Clone the Repository

```bash
git clone https://github.com/vansh070605/WakeGuard.git
cd WakeGuard
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run the Project

```bash
python app.py
```

## Applications

* Driver safety systems
* Smart transportation
* Fleet monitoring
* Fatigue detection systems
* AI-based surveillance

## Future Improvements

* Mobile application integration
* Advanced deep learning models
* Cloud-based monitoring dashboard
* Audio and vibration alerts
* Multi-person fatigue tracking
* Performance optimization for edge devices

## Contributing

Contributions are welcome. Fork the repository, create a new branch, and submit a pull request.

## License

This project is licensed under the MIT License.

## Author

Developed by Vansh Agrawal.

GitHub: [vansh070605/WakeGuard](https://github.com/vansh070605/WakeGuard)
