"""
HORUS OS — Python AI Vision starter
Real-time face/object detection from a webcam using OpenCV's built-in
Haar cascade. A friendly first step into computer vision.

Run:  python3 main.py        (press 'q' to quit)
Deps: pip install -r requirements.txt
"""
import sys
import cv2


def main() -> int:
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    detector = cv2.CascadeClassifier(cascade_path)

    cam = cv2.VideoCapture(0)
    if not cam.isOpened():
        print("No camera found. Plug in a webcam and try again.")
        return 1

    print("HORUS Vision running — press 'q' to quit.")
    while True:
        ok, frame = cam.read()
        if not ok:
            break
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector.detectMultiScale(gray, 1.1, 5, minSize=(60, 60))
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (39, 162, 201), 2)
            cv2.putText(frame, "face", (x, y - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (96, 208, 245), 2)
        cv2.putText(frame, f"HORUS Vision  faces: {len(faces)}", (12, 28),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (96, 208, 245), 2)
        cv2.imshow("HORUS Vision", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cam.release()
    cv2.destroyAllWindows()
    return 0


if __name__ == "__main__":
    sys.exit(main())
