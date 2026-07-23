# Frames extracted from hero.mp4 for /animate scroll scrubbing.
#
# Regenerate:
#   FF=$(node -e "process.stdout.write(require('ffmpeg-static'))")
#   rm -rf public/animate-frames && mkdir -p public/animate-frames
#   "$FF" -y -i public/hero.mp4 -vf "fps=24,scale=1280:-1" -q:v 2 public/animate-frames/frame_%04d.jpg
#
# Specs: 24 fps, 1280px wide, JPEG q=2 → 240 frames
