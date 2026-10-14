# DocNaut — Every File. One Place.

A privacy-first file toolkit built with Vite + React + TypeScript + Tailwind CSS + Framer Motion + Three.js (@react-three/fiber and @react-three/drei).

## Features

- **100% Client-Side**: All file processing happens in your browser. Your files never leave your device.
- **Smart Scanner (OCR)**: Extract text from images and PDFs using Tesseract.js with 14+ language support.
- **PDF Tools**: Merge, split, compress, rotate, convert to images, images to PDF, extract text.
- **Image Tools**: Convert between formats, compress, resize.
- **Document Tools**: Text to Word, JSON to CSV.
- **Utility Tools**: ZIP extractor, word counter, case converter, QR scanner.
- **3D Hero Scene**: Floating golden crown with Three.js, gold particles, and interactive parallax.
- **PWA**: Installable and works offline.
- **Responsive**: Mobile-first with simplified 3D on low-end devices.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Privacy

Every tool processes files entirely in your browser using WebAssembly and JavaScript. No file is ever uploaded to a server.
