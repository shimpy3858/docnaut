import { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { GoldDust } from '@/components/GoldDust';
import { GoldCursor } from '@/components/GoldCursor';
import { Footer } from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import { Hero } from '@/components/Hero';
import { ToolsGrid } from '@/components/ToolsGrid';
import { HowItWorks } from '@/components/HowItWorks';
import { WhyRajkosh } from '@/components/WhyRajkosh';
import { FAQ } from '@/components/FAQ';
import { Pricing } from '@/components/Pricing';
import { ScannerFeature } from '@/components/ScannerFeature';
import { tools } from '@/config/tools';
import { GenericTool } from '@/components/GenericTool';
import { LoadingScreen } from '@/components/LoadingScreen';

const ScanImageToText = lazy(() => import('@/tools/ScanImageToText').then(m => ({ default: m.ScanImageToText })));
const ScanPDFToText = lazy(() => import('@/tools/ScanPDFToText').then(m => ({ default: m.ScanPDFToText })));
const CameraScan = lazy(() => import('@/tools/CameraScan').then(m => ({ default: m.CameraScan })));
const QRScanner = lazy(() => import('@/tools/QRScanner').then(m => ({ default: m.QRScanner })));
const PDFToJPG = lazy(() => import('@/tools/PDFToJPG').then(m => ({ default: m.PDFToJPG })));
const ImageConverter = lazy(() => import('@/tools/ImageConverter').then(m => ({ default: m.ImageConverter })));
const ImageCompress = lazy(() => import('@/tools/ImageCompress').then(m => ({ default: m.ImageCompress })));
const ImageResize = lazy(() => import('@/tools/ImageResize').then(m => ({ default: m.ImageResize })));
const MergePDF = lazy(() => import('@/tools/MergePDF').then(m => ({ default: m.MergePDF })));
const SplitPDF = lazy(() => import('@/tools/SplitPDF').then(m => ({ default: m.SplitPDF })));
const CompressPDF = lazy(() => import('@/tools/CompressPDF').then(m => ({ default: m.CompressPDF })));
const RotatePDF = lazy(() => import('@/tools/RotatePDF').then(m => ({ default: m.RotatePDF })));
const ImagesToPDF = lazy(() => import('@/tools/ImagesToPDF').then(m => ({ default: m.ImagesToPDF })));
const PDFToText = lazy(() => import('@/tools/PDFToText').then(m => ({ default: m.PDFToText })));
const TextToWord = lazy(() => import('@/tools/TextToWord').then(m => ({ default: m.TextToWord })));
const JSONtoCSV = lazy(() => import('@/tools/JSONtoCSV').then(m => ({ default: m.JSONtoCSV })));
const WordCounter = lazy(() => import('@/tools/WordCounter').then(m => ({ default: m.WordCounter })));
const CaseConverter = lazy(() => import('@/tools/CaseConverter').then(m => ({ default: m.CaseConverter })));
const ZIPExtractor = lazy(() => import('@/tools/ZIPExtractor').then(m => ({ default: m.ZIPExtractor })));

const toolComponents: Record<string, React.ComponentType<any>> = {
  'scan-image-to-text': ScanImageToText,
  'scan-pdf-to-text': ScanPDFToText,
  'camera-scan': CameraScan,
  'qr-scanner': QRScanner,
  'pdf-to-jpg': PDFToJPG,
  'image-converter': ImageConverter,
  'image-compress': ImageCompress,
  'image-resize': ImageResize,
  'merge-pdf': MergePDF,
  'split-pdf': SplitPDF,
  'compress-pdf': CompressPDF,
  'rotate-pdf': RotatePDF,
  'images-to-pdf': ImagesToPDF,
  'pdf-to-text': PDFToText,
  'text-to-word': TextToWord,
  'json-to-csv': JSONtoCSV,
  'word-counter': WordCounter,
  'case-converter': CaseConverter,
  'zip-extractor': ZIPExtractor,
};

function ToolFallback() {
  return (
    <div className="min-h-screen pt-32 px-4 flex items-center justify-center">
      <div className="w-12 h-12 relative">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="3" />
          <circle cx="24" cy="24" r="20" fill="none" stroke="#D4AF37" strokeWidth="3" strokeDasharray="40 120" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <ScannerFeature />
      <ToolsGrid />
      <HowItWorks />
      <WhyRajkosh />
      <Pricing />
      <FAQ />
    </>
  );
}

function ToolRoute({ toolId }: { toolId: string }) {
  const tool = tools.find(t => t.id === toolId);
  const Component = toolComponents[toolId];

  if (Component) return <Component />;

  if (tool) {
    const Icon = tool.icon;
    return (
      <GenericTool
        icon={<Icon className="w-8 h-8 text-gold-400" />}
        title={tool.title}
        description={tool.description}
        badge={tool.badge}
      />
    );
  }

  return <div className="min-h-screen pt-32 text-center text-ivory/40">Tool not found</div>;
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  if (loading) return <LoadingScreen />;

  return (
    <HashRouter>
      <ToastProvider>
        <div className="relative min-h-screen jaali-bg overflow-x-hidden">
          <GoldDust />
          <GoldCursor />
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <Suspense fallback={<ToolFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tools/:toolId" element={<ToolRouteWithParam />} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </ToastProvider>
    </HashRouter>
  );
}

function ToolRouteWithParam() {
  const { toolId } = useParams<{ toolId: string }>();
  return <ToolRoute toolId={toolId || ''} />;
}
