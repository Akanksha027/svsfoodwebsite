# Bagoss font files

Home and locations pages use **Bagoss** from [Displaay Type Foundry](https://displaay.net/typeface/bagoss).

## Download (free trial)

1. Open [displaay.net/trials](https://displaay.net/trials)
2. Select **Bagoss** (Bagoss Standard is used on the site)
3. Submit the form — you’ll get a download link by email
4. From the trial package, copy **Bagoss Standard** files into this folder

## Folder layout

Your trial download uses subfolders. Keep them as-is:

```
public/fonts/bagoss/
  Bagoss Standard/   ← used on home + locations
  Bagoss Condensed/
  Bagoss Extended/
```

The site loads **Bagoss Standard** from `Bagoss Standard/` (woff2 preferred, otf fallback).

| Weight | WOFF2 (optional) | Trial OTF |
|--------|------------------|-----------|
| 400 | `BagossStandard-Regular.woff2` | `BagossStandard-TRIAL-Regular.otf` |
| 500 | `BagossStandard-Medium.woff2` | `BagossStandard-TRIAL-Medium.otf` |
| 600 | `BagossStandard-SemiBold.woff2` | `BagossStandard-TRIAL-SemiBold.otf` |
| 700 | `BagossStandard-Bold.woff2` | `BagossStandard-TRIAL-Bold.otf` |
| 800 | `BagossStandard-ExtraBold.woff2` | `BagossStandard-TRIAL-ExtraBold.otf` |
| 900 | `BagossStandard-Black.woff2` | `BagossStandard-TRIAL-Black.otf` |

At minimum, add **Regular** (400) and **Bold** (700) for headings and body.

## License

Trial fonts are for testing only. Purchase a web license from Displaay before production use: [displaay.net/typeface/bagoss](https://displaay.net/typeface/bagoss).
