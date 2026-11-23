"""Remove o fundo preto e o anel do logo SheepBotz, mantendo o escudo e o bode."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, out_dir = sys.argv[1], sys.argv[2]
img = Image.open(src).convert('RGB')
a = np.asarray(img).astype(np.int32)
h, w, _ = a.shape
lum = (a[..., 0] * 299 + a[..., 1] * 587 + a[..., 2] * 114) // 1000
dark = lum < 55

yy, xx = np.mgrid[0:h, 0:w]
cx, cy = w / 2, h / 2
dist = np.hypot(xx - cx, yy - cy)
ring_cut = dist > 0.468 * w          # anel externo e cantos

# Silhueta do escudo + bode: partes coloridas (não pretas), com frestas fechadas e
# buracos preenchidos; o preto fora dela é fundo.
struct = ndi.generate_binary_structure(2, 1)
colored = ~dark & ~ring_cut
closing_radius = int(0.024 * w)       # ~26 px: fecha frestas nas pontas dos chifres
closed = ndi.binary_closing(colored, structure=struct, iterations=closing_radius)
silhouette = ndi.binary_fill_holes(closed)
# Mantém só o maior componente (escudo + bode).
labels, n = ndi.label(silhouette)
sizes = ndi.sum(silhouette, labels, range(1, n + 1))
silhouette = labels == (int(np.argmax(sizes)) + 1)
background = ~silhouette
transparent = background | ring_cut
alpha = np.where(transparent, 0, 255).astype(np.uint8)
# Suaviza a borda do recorte.
alpha = ndi.gaussian_filter(alpha.astype(float), 0.8).clip(0, 255).astype(np.uint8)
alpha[ring_cut] = 0

rgba = np.dstack([a.astype(np.uint8), alpha])
im = Image.fromarray(rgba, 'RGBA')
bbox = im.getbbox()
im = im.crop(bbox)
side = max(im.size)
canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
canvas.paste(im, ((side - im.size[0]) // 2, (side - im.size[1]) // 2))
canvas.resize((512, 512), Image.LANCZOS).save(f'{out_dir}/sheepbotz-mark.png', optimize=True)
canvas.resize((128, 128), Image.LANCZOS).save(f'{out_dir}/favicon.png', optimize=True)
# Prévia sobre fundo claro e escuro para conferência.
for name, color in [('preview-light', (243, 243, 241, 255)), ('preview-dark', (10, 12, 10, 255))]:
    bg = Image.new('RGBA', canvas.size, color)
    bg.alpha_composite(canvas)
    bg.convert('RGB').resize((400, 400), Image.LANCZOS).save(f'{out_dir}/{name}.png')
# Cores dominantes (para os tokens).
mask = alpha > 200
px = a[mask]
greens = px[(px[:, 1] > 140) & (px[:, 0] < 140) & (px[:, 2] < 100)]
blues = px[(px[:, 2] > 120) & (px[:, 0] < 80) & (px[:, 1] < 110)]
print('verde médio', greens.mean(0).astype(int), 'azul médio', blues.mean(0).astype(int))
