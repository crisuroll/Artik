from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image, ImageFilter, ImageEnhance
import io
import os

app = Flask(__name__)
CORS(app, resources={r"/upload": {"origins": "*"}})

def simulate_glaze_protection(image: Image.Image) -> Image.Image:
    """
    Simula una protección estilo Glaze mejorada:
    - Añade ruido de alta frecuencia y patrones sinusoidales.
    - Aplica distorsión geométrica sutil (warp).
    - Ajusta localmente saturación y contraste.
    - Mantiene buena calidad visual.
    """
    import numpy as np
    from PIL import ImageEnhance

    image_np = np.array(image).astype(np.float32)

    # 1. Añadir ruido de alta frecuencia + patrón sinusoidal
    h, w, c = image_np.shape
    y, x = np.indices((h, w))
    sinusoidal = 8 * np.sin(2 * np.pi * (x / 32.0 + y / 24.0))
    noise = np.random.normal(0, 2.5, image_np.shape)
    image_np += noise + sinusoidal[..., None]

    # 2. Distorsión geométrica sutil (warp)
    def warp_channel(channel, strength=1.5):
        offset_x = (np.sin(np.linspace(0, np.pi * 2, w)) * strength).astype(np.float32)
        offset_y = (np.cos(np.linspace(0, np.pi * 2, h)) * strength).astype(np.float32)
        for i in range(h):
            channel[i, :] = np.roll(channel[i, :], int(offset_x[i % w]))
        for j in range(w):
            channel[:, j] = np.roll(channel[:, j], int(offset_y[j % h]))
        return channel

    for i in range(3):
        image_np[:, :, i] = warp_channel(image_np[:, :, i])

    image_np = np.clip(image_np, 0, 255).astype(np.uint8)
    img = Image.fromarray(image_np)

    # 3. Ajuste local de saturación y contraste
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(1.08)  # leve aumento de saturación
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.04)  # leve aumento de contraste

    return img


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
