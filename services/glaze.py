from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image, ImageFilter, ImageEnhance
import io
import os

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "*"}})

import numpy as np

def simulate_glaze_protection(image: Image.Image) -> Image.Image:
    """
    Simula una protección estilo Glaze más sutil:
    - Añade ruido de alta frecuencia casi imperceptible.
    - Aplica un leve desplazamiento por canal de color.
    - Mantiene buena calidad visual.
    """
    image_np = np.array(image).astype(np.float32)
    noise = np.random.normal(0, 2.0, image_np.shape)
    image_np += noise
    image_np = np.clip(image_np, 0, 255)
    shift_r = np.roll(image_np[:, :, 0], shift=1, axis=0)
    shift_g = np.roll(image_np[:, :, 1], shift=1, axis=1)
    shift_b = image_np[:, :, 2]

    image_np[:, :, 0] = shift_r
    image_np[:, :, 1] = shift_g
    image_np[:, :, 2] = shift_b

    image_np = np.clip(image_np, 0, 255).astype(np.uint8)

    return Image.fromarray(image_np)


@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No se encontró imagen en la solicitud'}), 400

    file = request.files['image']
    image = Image.open(file.stream)
    if image.mode == 'RGBA':
        image = image.convert('RGB')

    protected_image = simulate_glaze_protection(image)

    img_io = io.BytesIO()
    protected_image.save(img_io, 'JPEG', quality=95)
    img_io.seek(0)

    return send_file(img_io, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True)
