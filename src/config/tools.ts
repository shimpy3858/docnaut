import {
  ScanText, FileText, Image, FileImage, FilePlus, FileMinus, Scissors,
  Copy, Shrink, Stamp, Hash, Lock, Unlock, Crop, FileType, FileSearch,
  FileCode, FileSpreadsheet, Presentation, FileType2, PenTool, Settings2,
  Repeat, Images, ImagePlus, ImageMinus, Expand, Eraser, Link2, Smile,
  ArrowUpCircle, FileX, Video, Music, FileArchive, Calculator, CaseSensitive,
  Type, FileJson, BookOpen, ArrowRight,
  QrCode, Wand2, Sparkles,
} from 'lucide-react';

export type ToolCategory = 'all' | 'scanner' | 'pdf' | 'image' | 'document' | 'other';
import type { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  title: string;
  category: Exclude<ToolCategory, 'all'>;
  icon: LucideIcon;
  description: string;
  route: string;
  badge?: 'new' | 'beta';
  priority: boolean;
}

export const categories: { id: ToolCategory; label: string }[] = [
  { id: 'all', label: 'All Tools' },
  { id: 'scanner', label: 'Scanner' },
  { id: 'pdf', label: 'PDF' },
  { id: 'image', label: 'Image' },
  { id: 'document', label: 'Document' },
  { id: 'other', label: 'Other' },
];

export const tools: Tool[] = [
  // Scanner
  { id: 'scan-image-to-text', title: 'Scan Image to Text', category: 'scanner', icon: ScanText, description: 'Extract text from images using OCR in 14+ languages. 100% private.', route: '/tools/scan-image-to-text', priority: true },
  { id: 'scan-pdf-to-text', title: 'Scan PDF to Text', category: 'scanner', icon: FileSearch, description: 'OCR any PDF to extract searchable, editable text.', route: '/tools/scan-pdf-to-text', priority: true },
  { id: 'camera-scan', title: 'Live Camera Scan', category: 'scanner', icon: ScanText, description: 'Use your camera to scan documents in real-time with edge detection.', route: '/tools/camera-scan', badge: 'beta', priority: true },
  { id: 'qr-scanner', title: 'QR / Barcode Scanner', category: 'scanner', icon: QrCode, description: 'Scan QR codes and barcodes from images or camera.', route: '/tools/qr-scanner', badge: 'beta', priority: false },

  // PDF
  { id: 'pdf-to-jpg', title: 'PDF to JPG', category: 'pdf', icon: FileImage, description: 'Convert PDF pages to JPG images with quality and DPI control.', route: '/tools/pdf-to-jpg', priority: true },
  { id: 'pdf-to-png', title: 'PDF to PNG', category: 'pdf', icon: FileImage, description: 'Convert PDF pages to PNG images.', route: '/tools/pdf-to-png', priority: false },
  { id: 'images-to-pdf', title: 'Images to PDF', category: 'pdf', icon: FilePlus, description: 'Combine JPG, PNG, WebP into a PDF with page size and margin options.', route: '/tools/images-to-pdf', priority: true },
  { id: 'merge-pdf', title: 'Merge PDF', category: 'pdf', icon: FilePlus, description: 'Combine multiple PDFs into one document.', route: '/tools/merge-pdf', priority: true },
  { id: 'split-pdf', title: 'Split PDF', category: 'pdf', icon: FileMinus, description: 'Split a PDF by page ranges or extract individual pages.', route: '/tools/split-pdf', priority: true },
  { id: 'compress-pdf', title: 'Compress PDF', category: 'pdf', icon: Shrink, description: 'Reduce PDF file size while keeping quality.', route: '/tools/compress-pdf', priority: true },
  { id: 'rotate-pdf', title: 'Rotate PDF', category: 'pdf', icon: Repeat, description: 'Rotate pages in a PDF to fix orientation.', route: '/tools/rotate-pdf', priority: false },
  { id: 'pdf-to-text', title: 'PDF to Text', category: 'pdf', icon: FileText, description: 'Extract text content from any PDF.', route: '/tools/pdf-to-text', priority: false },
  { id: 'watermark-pdf', title: 'Watermark PDF', category: 'pdf', icon: Stamp, description: 'Add a text or image watermark to your PDF.', route: '/tools/watermark-pdf', badge: 'beta', priority: false },
  { id: 'pdf-page-numbers', title: 'Add Page Numbers', category: 'pdf', icon: Hash, description: 'Add page numbers to your PDF document.', route: '/tools/pdf-page-numbers', badge: 'beta', priority: false },
  { id: 'protect-pdf', title: 'Protect PDF', category: 'pdf', icon: Lock, description: 'Add a password to your PDF.', route: '/tools/protect-pdf', badge: 'beta', priority: false },
  { id: 'unlock-pdf', title: 'Unlock PDF', category: 'pdf', icon: Unlock, description: 'Remove a password from a PDF (if you know it).', route: '/tools/unlock-pdf', badge: 'beta', priority: false },

  // Image
  { id: 'image-converter', title: 'Image Converter', category: 'image', icon: Images, description: 'Convert between JPG, PNG, WebP, GIF, BMP, and more.', route: '/tools/image-converter', priority: true },
  { id: 'image-compress', title: 'Compress Image', category: 'image', icon: Shrink, description: 'Reduce image file size with quality slider and before/after preview.', route: '/tools/image-compress', priority: true },
  { id: 'image-resize', title: 'Resize Image', category: 'image', icon: Expand, description: 'Resize images to custom dimensions.', route: '/tools/image-resize', priority: false },
  { id: 'image-crop', title: 'Crop Image', category: 'image', icon: Crop, description: 'Crop images to any area.', route: '/tools/image-crop', badge: 'beta', priority: false },
  { id: 'image-rotate', title: 'Rotate / Flip', category: 'image', icon: Repeat, description: 'Rotate or flip images.', route: '/tools/image-rotate', priority: false },
  { id: 'background-remover', title: 'Background Remover', category: 'image', icon: Eraser, description: 'Remove image backgrounds instantly, right in your browser.', route: '/tools/background-remover', badge: 'beta', priority: false },
  { id: 'image-to-base64', title: 'Image to Base64', category: 'image', icon: Link2, description: 'Convert images to Base64 strings and back.', route: '/tools/image-to-base64', priority: false },

  // Document / Data
  { id: 'text-to-word', title: 'Text to Word', category: 'document', icon: FileType, description: 'Convert plain text to a Word document.', route: '/tools/text-to-word', priority: false },
  { id: 'word-to-pdf', title: 'Word to PDF', category: 'document', icon: FileType2, description: 'Convert Word documents to PDF.', route: '/tools/word-to-pdf', badge: 'beta', priority: false },
  { id: 'csv-to-excel', title: 'CSV to Excel', category: 'document', icon: FileSpreadsheet, description: 'Convert CSV files to Excel spreadsheets.', route: '/tools/csv-to-excel', badge: 'beta', priority: false },
  { id: 'json-to-csv', title: 'JSON to CSV', category: 'document', icon: FileJson, description: 'Convert JSON data to CSV format.', route: '/tools/json-to-csv', priority: false },
  { id: 'markdown-to-pdf', title: 'Markdown to PDF', category: 'document', icon: FileCode, description: 'Convert Markdown files to formatted PDF.', route: '/tools/markdown-to-pdf', badge: 'beta', priority: false },

  // Other
  { id: 'zip-extractor', title: 'ZIP Extractor', category: 'other', icon: FileArchive, description: 'Extract files from ZIP archives or create ZIP files.', route: '/tools/zip-extractor', priority: false },
  { id: 'word-counter', title: 'Word Counter', category: 'other', icon: BookOpen, description: 'Count words, characters, sentences, and reading time.', route: '/tools/word-counter', priority: false },
  { id: 'case-converter', title: 'Case Converter', category: 'other', icon: CaseSensitive, description: 'Convert text to uppercase, lowercase, title case, and more.', route: '/tools/case-converter', priority: false },
];
