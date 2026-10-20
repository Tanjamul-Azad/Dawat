# Invitation font instances

The Bengali subset of Noto Serif Bengali was originally self-hosted by Next's Google font loader. Its full 100–900 variable weight file was 191,564 bytes. The invitation uses 400 and 500. FontTools 4.62.1 instantiated those two weights without removing Bengali glyphs or shaping tables: 58,684 and 69,868 bytes respectively. Latin text falls back to the existing Fraunces family. The original source is retained here for reproducibility.

License: SIL OFL 1.1, copyright 2022 The Noto Project Authors. The license ships at `public/fonts/Noto-Serif-Bengali-OFL.txt`; upstream: https://github.com/google/fonts/tree/main/ofl/notoserifbengali and https://github.com/notofonts/bengali.

Regenerate from `web/` with Python FontTools and Brotli installed:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

for weight in (400, 500):
    font = TTFont('design-source/fonts/noto-serif-bengali-bengali-variable.woff2')
    instantiateVariableFont(font, {'wght': weight}, inplace=True)
    font.save(f'src/app/fonts/noto-serif-bengali-{weight}.woff2')
```

Do not subset these files to the current sample text: customer names and Bengali conjuncts must remain supported.
