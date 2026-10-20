"""Build time-labelled sheets from the locally extracted one-frame-per-second video."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent
frames = sorted((root / 'frames').glob('second-*.png'))
for start in range(0, len(frames), 8):
    sheet = Image.new('RGB', (4 * 288, 2 * 676), '#e5e5e5')
    draw = ImageDraw.Draw(sheet)
    for offset, path in enumerate(frames[start:start + 8]):
        frame = Image.open(path).convert('RGB')
        frame.thumbnail((288, 648))
        x, y = (offset % 4) * 288, (offset // 4) * 676
        sheet.paste(frame, (x, y + 28))
        draw.text((x + 8, y + 6), f'Approx. {start + offset + 0.5:.1f} seconds', fill='black')
    sheet.save(root / f'contact-sheet-{start // 8 + 1}.jpg', quality=90)
print(f'Created contact sheets for {len(frames)} frames.')
