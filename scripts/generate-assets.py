"""Generate the real printable ChArUco board and installable PWA icons.
Requires: pip install opencv-contrib-python numpy
"""
from pathlib import Path
import cv2
import numpy as np

output = Path(__file__).resolve().parents[1] / "public"
dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
board = cv2.aruco.CharucoBoard((7, 5), 0.020, 0.014, dictionary)
image = board.generateImage((1400, 1000), marginSize=0, borderBits=1)
cv2.imwrite(str(output / "charuco-board.png"), image)
corners, ids, rejected = cv2.aruco.ArucoDetector(dictionary).detectMarkers(image)
assert ids is not None and len(ids) == 17, "The generated board must contain 17 valid ArUco markers."
for size in (192, 512):
    icon = np.full((512, 512, 3), (28, 23, 16), np.uint8)
    color = (196, 232, 165)
    outline = np.array([[256,100],[392,178],[392,334],[256,412],[120,334],[120,178]], np.int32)
    cv2.polylines(icon, [outline], True, color, 25, cv2.LINE_AA)
    cv2.line(icon, (120,178), (256,256), color, 25, cv2.LINE_AA)
    cv2.line(icon, (392,178), (256,256), color, 25, cv2.LINE_AA)
    cv2.line(icon, (256,256), (256,412), color, 25, cv2.LINE_AA)
    cv2.imwrite(str(output / ("icon-" + str(size) + ".png")), cv2.resize(icon, (size,size), interpolation=cv2.INTER_AREA))
print("Generated ChArUco board: 17 markers verified. PWA icons: 192px and 512px.")
