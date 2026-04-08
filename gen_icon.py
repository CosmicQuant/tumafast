"""Generate adaptive icon foreground PNGs with 'Axon' text properly within safe zone."""
from PIL import Image, ImageDraw, ImageFont
import os

# Android adaptive icon sizes: foreground must be 108dp × 108dp equivalent
# The safe zone is the inner 66dp (≈61%) circle — text must fit there
SIZES = {
    'mipmap-ldpi': 81,
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
}

GREEN = (22, 163, 74)  # brand-600 (#16a34a)
WHITE = (255, 255, 255)
BG_GREEN = (34, 197, 94)  # brand-500

BASE = r"c:\Users\ADMIN\Desktop\axon\android\app\src\main\res"

for folder, size in SIZES.items():
    # --- Foreground: white "Axon" text on transparent, sized within safe zone ---
    fg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(fg)

    # Safe zone is ~61% of the icon (inner circle)
    # Text should be about 50% of the icon width to stay safely inside
    target_text_width = size * 0.48
    
    # Find font size that fits
    font_size = int(size * 0.35)
    font = ImageFont.truetype("arial.ttf", font_size) if os.path.exists("C:/Windows/Fonts/arial.ttf") else ImageFont.load_default()
    
    # Try to load bold Arial
    for font_path in ["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/arial.ttf"]:
        if os.path.exists(font_path):
            # Binary search for right font size
            lo, hi = 10, int(size * 0.5)
            while lo < hi:
                mid = (lo + hi + 1) // 2
                test_font = ImageFont.truetype(font_path, mid)
                bbox = draw.textbbox((0, 0), "Axon", font=test_font)
                tw = bbox[2] - bbox[0]
                if tw <= target_text_width:
                    lo = mid
                else:
                    hi = mid - 1
            font = ImageFont.truetype(font_path, lo)
            break

    # Center text
    bbox = draw.textbbox((0, 0), "Axon", font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1]
    draw.text((x, y), "Axon", fill=WHITE, font=font)

    fg_path = os.path.join(BASE, folder, "ic_launcher_foreground.png")
    fg.save(fg_path)
    print(f"  Foreground: {fg_path} ({size}x{size})")

    # --- Background: solid green ---
    bg = Image.new('RGBA', (size, size), BG_GREEN)
    bg_path = os.path.join(BASE, folder, "ic_launcher_background.png")
    bg.save(bg_path)

    # --- Legacy ic_launcher.png: green with white text, rounded square ---
    legacy_size = {
        'mipmap-ldpi': 36,
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192,
    }[folder]
    
    legacy = Image.new('RGBA', (legacy_size, legacy_size), (0, 0, 0, 0))
    ld = ImageDraw.Draw(legacy)
    radius = int(legacy_size * 0.22)
    ld.rounded_rectangle([(0, 0), (legacy_size - 1, legacy_size - 1)], radius=radius, fill=BG_GREEN)
    
    # Text for legacy
    leg_target = legacy_size * 0.7
    for font_path in ["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/arial.ttf"]:
        if os.path.exists(font_path):
            lo2, hi2 = 8, int(legacy_size * 0.5)
            while lo2 < hi2:
                mid2 = (lo2 + hi2 + 1) // 2
                tf2 = ImageFont.truetype(font_path, mid2)
                bb2 = ld.textbbox((0, 0), "Axon", font=tf2)
                if bb2[2] - bb2[0] <= leg_target:
                    lo2 = mid2
                else:
                    hi2 = mid2 - 1
            leg_font = ImageFont.truetype(font_path, lo2)
            break
    
    bb2 = ld.textbbox((0, 0), "Axon", font=leg_font)
    tw2, th2 = bb2[2] - bb2[0], bb2[3] - bb2[1]
    ld.text(((legacy_size - tw2) / 2 - bb2[0], (legacy_size - th2) / 2 - bb2[1]), "Axon", fill=WHITE, font=leg_font)
    
    legacy_path = os.path.join(BASE, folder, "ic_launcher.png")
    legacy.save(legacy_path)
    
    # Round version
    round_img = Image.new('RGBA', (legacy_size, legacy_size), (0, 0, 0, 0))
    rd = ImageDraw.Draw(round_img)
    rd.ellipse([(0, 0), (legacy_size - 1, legacy_size - 1)], fill=BG_GREEN)
    rd.text(((legacy_size - tw2) / 2 - bb2[0], (legacy_size - th2) / 2 - bb2[1]), "Axon", fill=WHITE, font=leg_font)
    round_path = os.path.join(BASE, folder, "ic_launcher_round.png")
    round_img.save(round_path)

print("\nAll icons generated!")
