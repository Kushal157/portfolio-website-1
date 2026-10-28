import React, { useState, useEffect, useMemo } from 'react';
import { Dock } from './components/Dock';
import { ScrollSection, RotateSection } from './components/ScrollSection';
import { PageTransition } from './components/PageTransition';
import { GrainOverlay } from './components/GrainOverlay';
import { AnimatedBackground } from './components/AnimatedBackground';
import { MagneticButton } from './components/MagneticButton';
import { LinkedInOcto, GitHubOcto, ProjectsOcto, AboutOcto, ContactOcto } from './components/DockIcons';
import { LOCAL_LOTTIE_ICONS } from './components/localIcons';
import { WaterFrame } from './components/WaterFrame';
import {
  Code,
  Sparkles,
  Rocket,
  ArrowRight,
  Mail,
  Linkedin,
  Github,
  Eye,
  X as XIcon,
  ExternalLink,
  Globe,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Lazy-loaded components
const Lottie = React.lazy(() => import('lottie-react'));
const AdminDashboard = React.lazy(() =>
  import('./components/AdminDashboard').then(({ AdminDashboard }) => ({ default: AdminDashboard })),
);

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a70c1202`;

type Section = 'home' | 'about' | 'projects' | 'contact' | 'admin';
type LuxeMode = 'midnight' | 'aurora';

// Error Boundary to prevent Lottie crashes from taking down the app
class LottieErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="w-10 h-10 rounded-2xl bg-white/10" />;
    }
    return this.props.children;
  }
}

// Memory cache for fetched Lottie animations
const lottieCache = new Map<string, any>();

// High-performance dock icon component: loads instantly with local data, plays on hover
const LottieDockIcon = React.memo(function LottieDockIcon({
  signedUrl,
  localData,
  fallback,
}: {
  signedUrl?: string;
  localData?: any;
  fallback?: React.ReactNode;
}) {
  const [animData, setAnimData] = useState<any>(() => localData || null);
  const lottieRef = React.useRef<any>(null);

  useEffect(() => {
    if (localData) {
      setAnimData(localData);
      return;
    }
    if (!signedUrl) return;

    if (lottieCache.has(signedUrl)) {
      setAnimData(lottieCache.get(signedUrl));
      return;
    }

    let isMounted = true;
    fetch(signedUrl)
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((data) => {
        if (isMounted && data && typeof data === 'object') {
          lottieCache.set(signedUrl, data);
          setAnimData(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [signedUrl, localData]);

  if (!animData && fallback) {
    return <>{fallback}</>;
  }

  return (
    <LottieErrorBoundary fallback={fallback}>
      <React.Suspense fallback={fallback || <div className="w-10 h-10 rounded-2xl bg-white/10" />}>
        <div
          className="w-10 h-10 flex items-center justify-center select-none"
          onMouseEnter={() => {
            try {
              lottieRef.current?.goToAndPlay?.(0, true);
            } catch (_) {}
          }}
        >
          {animData ? (
            <Lottie
              lottieRef={lottieRef}
              animationData={animData}
              loop={false}
              autoplay={false}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            fallback || <div className="w-10 h-10 rounded-2xl bg-white/10" />
          )}
        </div>
      </React.Suspense>
    </LottieErrorBoundary>
  );
});

// Kushal's verified portfolio initial state for instant zero-lag first paint
const INITIAL_SITE_DATA = {
  allowIconEdit: true,
  hero: {
    welcome: 'Welcome to my Portfolio',
    name: 'KUSHAL N',
    subtitle: 'Creative Developer & Designer',
    description:
      'Crafting unique digital experiences with cutting-edge technologies. Specializing in creating stunning interfaces that blend creativity with functionality.',
    heroMediaType: 'photo',
    imageStoragePath: '1774160204389-hero-rdna.ci.webp',
    imageUrl:
      'https://vxhoaqghvajsrtsvhksb.supabase.co/storage/v1/object/sign/make-a70c1202-assets/1774160204389-hero-rdna.ci.webp?token=eyJraWQiOiI5ZjJmZDA4OS0xYTgzLTQ3MTQtYjlhYy04NDYzODlmOWI1ZDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWtlLWE3MGMxMjAyLWFzc2V0cy8xNzc0MTYwMjA0Mzg5LWhlcm8tcmRuYS5jaS53ZWJwIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MzIwMDA3NSwiZXhwIjoxNzkzODA0ODc1fQ.iBRUh2G8tUHwWDimDnZq0QkBDG_YrVzzYRlHXH_lK50',
  },
  projects: [
    {
      title: 'E-Commerce Platform',
      description:
        'A modern e-commerce solution featuring real-time inventory, seamless checkout, and advanced analytics.',
      tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'TypeScript'],
      year: '2026',
      deployedUrl: 'https://play-points2026-sdig.vercel.app/',
      githubUrl: 'https://github.com/1si24ci401-spec/play_points2026.git',
      imageStoragePath: '1781775307700-project-0-Screenshot_2026-06-18_150449.png',
      imageUrl:
        'https://vxhoaqghvajsrtsvhksb.supabase.co/storage/v1/object/sign/make-a70c1202-assets/1781775307700-project-0-Screenshot_2026-06-18_150449.png?token=eyJraWQiOiI5ZjJmZDA4OS0xYTgzLTQ3MTQtYjlhYy04NDYzODlmOWI1ZDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWtlLWE3MGMxMjAyLWFzc2V0cy8xNzgxNzc1MzA3NzAwLXByb2plY3QtMC1TY3JlZW5zaG90XzIwMjYtMDYtMThfMTUwNDQ5LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTMyMDAwNzUsImV4cCI6MTc5MzgwNDg3NX0.PZ--eaR49iUmR-v3Bgq7CAR3l1qVO6atHhgYZdT49eM',
    },
    {
      title: 'Aegis prime',
      description:
        'AEGIS PRIME is a post-quantum sovereign intelligence microkernel and zero-trust security mesh. Built on React 19, TypeScript, and Vite, it combines real-time AI reasoning via Groq with NIST FIPS 203 ML-KEM lattice cryptography, formal Z3 SMT verification invariants, and Supabase cloud authentication. It features interactive HTML5 quantum particle telemetry, real-time cybernetic system monitoring, and honeypot intrusion detection.',
      tech: [
        'React 19',
        'TypeScript',
        'Vite',
        'Tailwind CSS v4',
        'Framer Motion',
        'HTML5 Canvas',
        'Groq Cloud API',
        'Supabase',
        'PostgreSQL',
        'Python',
        'FastAPI',
        'WebAssembly',
        'NIST ML-KEM-768 Lattice Cryptography',
        'Z3 Theorem Prover',
        'Vercel',
      ],
      year: '2026',
      deployedUrl: 'https://lumina-synapse-t4su.vercel.app/',
      githubUrl: 'https://github.com/1si24ci401-spec/lumina-synapse.git',
      imageStoragePath: '1793198503733-project-2-Screenshot_2026-10-28_201130.png',
      imageUrl:
        'https://vxhoaqghvajsrtsvhksb.supabase.co/storage/v1/object/sign/make-a70c1202-assets/1793198503733-project-2-Screenshot_2026-10-28_201130.png?token=eyJraWQiOiI5ZjJmZDA4OS0xYTgzLTQ3MTQtYjlhYy04NDYzODlmOWI1ZDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYWtlLWE3MGMxMjAyLWFzc2V0cy8xNzkzMTk4NTAzNzMzLXByb2plY3QtMi1TY3JlZW5zaG90XzIwMjYtMTAtMjhfMjAxMTMwLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3OTMyMDAwNzUsImV4cCI6MTc5MzgwNDg3NX0.bKyEnhUHS_11I37DM3Q-2GBH1kpf-FoM_rnDpGGNKLc',
    },
  ],
  dockIcons: [
    {
      id: 'linkedin',
      type: 'CustomImage',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/kushal-n-a237bb359',
      action: '',
      isLottie: true,
      lottieData: LOCAL_LOTTIE_ICONS.linkedin,
    },
    {
      id: 'github',
      type: 'CustomImage',
      label: 'GitHub',
      url: 'https://github.com/kushal157',
      action: '',
      isLottie: true,
      lottieData: LOCAL_LOTTIE_ICONS.github,
    },
    {
      id: 'projects',
      type: 'CustomImage',
      label: 'Projects',
      url: '',
      action: 'projects',
      isLottie: true,
      lottieData: LOCAL_LOTTIE_ICONS.projects,
    },
    {
      id: 'about',
      type: 'CustomImage',
      label: 'About Me',
      url: '',
      action: 'about',
      isLottie: true,
      lottieData: LOCAL_LOTTIE_ICONS.about,
    },
    {
      id: 'contact',
      type: 'CustomImage',
      label: 'Contact',
      url: '',
      action: 'contact',
      isLottie: true,
      lottieData: LOCAL_LOTTIE_ICONS.contact,
    },
  ],
  about: {
    paragraph1:
      "I'm a passionate creative developer dedicated to crafting exceptional digital experiences that seamlessly blend form and function.",
    paragraph2:
      'With years of experience in web development and design, I specialize in creating immersive, user-centric interfaces using cutting-edge technologies.',
    paragraph3:
      'My approach combines technical expertise with creative vision, ensuring every project not only meets but exceeds expectations.',
    skills: 'React, TypeScript, Next.js, Node.js, Tailwind CSS, Motion, Three.js, GraphQL, PostgreSQL, AWS, Docker, Figma',
  },
  cta: {
    heading: "Let's Create Something",
    highlight: 'Extraordinary',
    subtext: "Ready to bring your vision to life? Let's collaborate and build something amazing together.",
  },
  contacts: [
    { id: 'email', platform: 'Email', value: 'kushaln.24.27@gmail.com', url: 'mailto:kushaln.24.27@gmail.com', iconType: 'Mail' },
    { id: 'linkedin', platform: 'LinkedIn', value: '/in/Kushal N', url: 'https://www.linkedin.com/in/kushal-n-a237bb359', iconType: 'Linkedin' },
    { id: 'github', platform: 'GitHub', value: '@kushaln', url: 'https://github.com/kushal157', iconType: 'Github' },
  ],
};

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [luxeMode, setLuxeMode] = useState<LuxeMode>(() => {
    const hour = new Date().getHours();
    return hour >= 15 ? 'midnight' : 'aurora';
  });
  const isAurora = luxeMode === 'aurora';
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const [siteData, setSiteData] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('kushal_portfolio_data');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            return { ...INITIAL_SITE_DATA, ...parsed };
          }
        }
      } catch (_) {}
    }
    return INITIAL_SITE_DATA;
  });

  useEffect(() => {
    // Background fetch site data (Stale-While-Revalidate pattern)
    fetch(`${SERVER_URL}/sitedata`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data && typeof res.data === 'object') {
          setSiteData((prev: any) => {
            let heroSignedUrl = res.data.hero?.imageUrl;
            let cleanProjects = Array.isArray(res.data.projects) ? res.data.projects : prev.projects;

            if (Array.isArray(res.data.projects)) {
              const proxy = res.data.projects.find((p: any) => p._heroProxy);
              if (proxy && proxy.imageUrl) {
                heroSignedUrl = proxy.imageUrl;
              }
              cleanProjects = res.data.projects.filter((p: any) => !p._heroProxy);
            }

            // Ensure dock icons have local Lottie data attached
            const dockIcons = (Array.isArray(res.data.dockIcons) ? res.data.dockIcons : prev.dockIcons).map(
              (icon: any) => {
                if (icon.isLottie && !icon.lottieData && LOCAL_LOTTIE_ICONS[icon.id]) {
                  return { ...icon, lottieData: LOCAL_LOTTIE_ICONS[icon.id] };
                }
                return icon;
              },
            );

            const updated = {
              ...prev,
              ...res.data,
              hero: {
                ...prev.hero,
                ...(res.data.hero || {}),
                imageUrl: heroSignedUrl || res.data.hero?.imageUrl || prev.hero.imageUrl,
              },
              projects: cleanProjects,
              dockIcons,
            };

            try {
              sessionStorage.setItem('kushal_portfolio_data', JSON.stringify(updated));
            } catch (_) {}

            return updated;
          });
        }
      })
      .catch((err) => console.error('Failed to fetch site data:', err));
  }, []);

  const iconComponents: Record<string, React.ReactNode> = useMemo(
    () => ({
      LinkedInOcto: <LinkedInOcto />,
      GitHubOcto: <GitHubOcto />,
      ProjectsOcto: <ProjectsOcto />,
      AboutOcto: <AboutOcto />,
      ContactOcto: <ContactOcto />,
      AdminOcto: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      ModeOcto:
        luxeMode === 'midnight' ? (
          <Moon className="w-5 h-5 text-blue-400" />
        ) : (
          <Sun className="w-5 h-5 text-amber-400" />
        ),
    }),
    [luxeMode],
  );

  const fallbackMap: Record<string, React.ReactNode> = useMemo(
    () => ({
      linkedin: <LinkedInOcto />,
      github: <GitHubOcto />,
      projects: <ProjectsOcto />,
      about: <AboutOcto />,
      contact: <ContactOcto />,
    }),
    [],
  );

  const dockItems = useMemo(() => {
    return (Array.isArray(siteData.dockIcons) ? siteData.dockIcons : []).map((icon: any) => {
      const fallback = fallbackMap[icon.id] || (icon.type && iconComponents[icon.type]) || <ProjectsOcto />;

      let renderedIcon: React.ReactNode;
      if (icon?.type === 'CustomImage' && (icon?.customIconData || icon?.storagePath || icon?.lottieData || LOCAL_LOTTIE_ICONS[icon.id])) {
        if (icon?.isLottie || icon?.lottieData || LOCAL_LOTTIE_ICONS[icon.id]) {
          renderedIcon = (
            <LottieDockIcon
              signedUrl={icon.isLottie ? icon.customIconData : undefined}
              localData={icon.lottieData || LOCAL_LOTTIE_ICONS[icon.id]}
              fallback={fallback}
            />
          );
        } else {
          renderedIcon = (
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={icon.customIconData || icon.storagePath}
                alt={icon.label || 'Custom'}
                className="w-full h-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          );
        }
      } else if (icon?.type && iconComponents[icon.type]) {
        renderedIcon = iconComponents[icon.type];
      } else {
        renderedIcon = fallback;
      }

      return {
        id: icon?.id || Math.random().toString(),
        icon: renderedIcon,
        label: icon?.label || '',
        onClick: () => {
          if (icon?.url) {
            window.open(icon.url, '_blank', 'noopener,noreferrer');
          } else if (icon?.action) {
            setActiveSection(icon.action as Section);
          }
        },
      };
    });
  }, [siteData.dockIcons, iconComponents, fallbackMap]);

  return (
    <div
      className="min-h-screen bg-[#0F172A] overflow-x-hidden"
      data-luxe={luxeMode}
      style={{ transition: 'background-color 1.5s ease-in-out' }}
    >
      {/* Optimized Grain Texture */}
      <GrainOverlay />

      {/* Hardware-accelerated Animated Background */}
      <AnimatedBackground luxeMode={luxeMode} />

      {/* Main Content */}
      <div className="relative z-10">
        <PageTransition transitionKey={activeSection}>
          {activeSection === 'home' && (
            <div className="min-h-screen">
              {/* Hero Section */}
              <section className="container mx-auto px-6 min-h-screen flex items-center justify-center relative">
                <div className="max-w-6xl w-full relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="flex-1 md:max-w-2xl">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`text-6xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tight leading-none ${
                        isAurora ? 'aurora-gradient-text' : 'text-slate-50'
                      }`}
                    >
                      {siteData.hero.name}
                    </motion.h1>

                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-2xl md:text-4xl lg:text-5xl mb-8 font-light"
                      style={{
                        color: isAurora ? 'var(--aurora-subheading)' : undefined,
                        transition: 'color 1.5s ease-in-out',
                      }}
                    >
                      {siteData.hero.subtitle}
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-lg md:text-xl max-w-2xl mb-12 leading-relaxed"
                      style={{
                        color: isAurora ? 'var(--aurora-body)' : '#CBD5E1',
                        transition: 'color 1.5s ease-in-out',
                      }}
                    >
                      {siteData.hero.description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="flex flex-wrap gap-4"
                    >
                      <MagneticButton variant="primary" onClick={() => setActiveSection('projects')}>
                        View My Work
                        <ArrowRight className="w-5 h-5" />
                      </MagneticButton>
                      <MagneticButton variant="ghost" onClick={() => setActiveSection('contact')}>
                        Get in Touch
                      </MagneticButton>
                    </motion.div>
                  </div>

                  {siteData.hero?.heroMediaType === 'video' && siteData.hero?.videoFileName ? (
                    <div className="flex-1 w-full flex justify-center md:justify-end mt-12 md:mt-0">
                      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl shadow-blue-500/20">
                        <video
                          src={`/${siteData.hero.videoFileName}`}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          loop
                          autoPlay
                          preload="metadata"
                        />
                      </div>
                    </div>
                  ) : siteData.hero?.imageUrl || siteData.hero?.imageStoragePath ? (
                    <div className="flex-1 w-full flex justify-center md:justify-end mt-12 md:mt-0">
                      <WaterFrame imageUrl={siteData.hero.imageUrl || siteData.hero.imageStoragePath} />
                    </div>
                  ) : null}
                </div>
              </section>

              {/* Feature Sections */}
              <section className="container mx-auto px-6 py-28">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[
                    {
                      icon: <Code className="w-12 h-12" />,
                      title: 'Clean Code',
                      desc: 'Building maintainable and scalable solutions with industry best practices.',
                    },
                    {
                      icon: <Sparkles className="w-12 h-12" />,
                      title: 'Creative Design',
                      desc: 'Crafting beautiful, pixel-perfect interfaces with meticulous attention to detail.',
                    },
                    {
                      icon: <Rocket className="w-12 h-12" />,
                      title: 'Performance',
                      desc: 'Optimized for blazing-fast load speeds, fluid 60fps animations, and zero jank.',
                    },
                  ].map((feature, i) => (
                    <ScrollSection key={i}>
                      <div
                        className={`group relative p-8 rounded-2xl border luxe-card transition-all duration-300 ${
                          isAurora
                            ? ''
                            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                        }`}
                      >
                        <div className="text-blue-400 mb-6 group-hover:scale-105 transition-transform duration-300">
                          {feature.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-50 mb-3">{feature.title}</h3>
                        <p className="text-slate-300 leading-relaxed">{feature.desc}</p>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
                      </div>
                    </ScrollSection>
                  ))}
                </div>
              </section>

              {/* CTA Section */}
              <section className="container mx-auto px-6 py-28">
                <RotateSection>
                  <div className="max-w-4xl mx-auto text-center">
                    <div className="relative p-12 md:p-16 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-60" />
                      <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold text-slate-50 mb-6">
                          {siteData.cta?.heading || "Let's Create Something"}
                          <br />
                          <span
                            className={
                              isAurora
                                ? 'aurora-gradient-text'
                                : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent'
                            }
                          >
                            {siteData.cta?.highlight || 'Extraordinary'}
                          </span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                          {siteData.cta?.subtext ||
                            "Ready to bring your vision to life? Let's collaborate and build something amazing together."}
                        </p>
                        <MagneticButton variant="primary" onClick={() => setActiveSection('contact')}>
                          Start a Project
                          <ArrowRight className="w-5 h-5" />
                        </MagneticButton>
                      </div>
                    </div>
                  </div>
                </RotateSection>
              </section>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="min-h-screen container mx-auto px-6 py-20 md:py-32">
              <div className="max-w-5xl mx-auto">
                <MagneticButton
                  onClick={() => setActiveSection('home')}
                  className="text-gray-400 hover:text-white mb-12 flex items-center gap-2 transition-colors text-sm uppercase tracking-wider"
                >
                  ← Back
                </MagneticButton>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <h2 className={`text-5xl md:text-7xl font-bold mb-8 ${isAurora ? 'aurora-gradient-text' : 'text-slate-50'}`}>
                    About Me
                  </h2>

                  <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div
                      className="space-y-6 text-lg leading-relaxed font-light"
                      style={{ color: isAurora ? 'var(--aurora-body)' : '#CBD5E1', transition: 'color 1.5s ease-in-out' }}
                    >
                      <p>
                        {siteData.about?.paragraph1 ||
                          "I'm a passionate creative developer dedicated to crafting exceptional digital experiences."}
                      </p>
                      <p>
                        {siteData.about?.paragraph2 ||
                          'With years of experience in web development and design, I specialize in creating immersive, user-centric interfaces.'}
                      </p>
                      <p>
                        {siteData.about?.paragraph3 ||
                          'My approach combines technical expertise with creative vision, ensuring every project exceeds expectations.'}
                      </p>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4 uppercase tracking-wider">Expertise</h3>
                        <div className="space-y-4">
                          {[
                            { skill: 'Frontend Development', level: 95 },
                            { skill: 'UI/UX Design', level: 90 },
                            { skill: 'Backend Development', level: 85 },
                            { skill: 'Motion & Performance', level: 92 },
                          ].map((item) => (
                            <div key={item.skill}>
                              <div className="flex justify-between text-sm mb-2">
                                <span
                                  className="font-medium"
                                  style={{
                                    color: isAurora ? 'var(--aurora-muted)' : '#94A3B8',
                                    transition: 'color 1.5s ease-in-out',
                                  }}
                                >
                                  {item.skill}
                                </span>
                                <span
                                  className="font-bold luxe-accent-icon"
                                  style={{
                                    color: isAurora ? 'var(--aurora-primary)' : '#60A5FA',
                                    transition: 'color 1.5s ease-in-out',
                                  }}
                                >
                                  {item.level}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isAurora
                                      ? 'bg-gradient-to-r from-[#8b5cf6] to-[#d946ef]'
                                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                  }`}
                                  style={{
                                    width: `${item.level}%`,
                                    transition: 'width 1s ease-out',
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-6 uppercase tracking-wider">Tech Stack</h3>
                    <div className="flex flex-wrap gap-3">
                      {(
                        siteData.about?.skills ||
                        'React, TypeScript, Next.js, Node.js, Tailwind CSS, Motion, Three.js, GraphQL, PostgreSQL, AWS, Docker, Figma'
                      )
                        .split(',')
                        .map((skill) => skill.trim())
                        .filter(Boolean)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="luxe-badge px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="mt-28 flex justify-center opacity-30 hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => setActiveSection('admin')}
                      className="cursor-pointer p-4 group flex flex-col items-center gap-2 rounded-full hover:bg-white/5 transition-colors"
                      aria-label="Admin Access"
                    >
                      <ShieldCheck className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {activeSection === 'projects' && (
            <div className="min-h-screen container mx-auto px-6 py-20 md:py-32">
              <div className="max-w-7xl mx-auto">
                <MagneticButton
                  onClick={() => setActiveSection('home')}
                  className="text-gray-400 hover:text-white mb-12 flex items-center gap-2 transition-colors text-sm uppercase tracking-wider"
                >
                  ← Back
                </MagneticButton>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-5xl md:text-7xl font-bold text-slate-50 mb-16"
                >
                  Selected Works
                </motion.h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {(Array.isArray(siteData.projects) ? siteData.projects : []).map((project: any, index: number) => (
                    <div
                      key={project?.title || index}
                      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 backdrop-blur-sm transition-all duration-300 cursor-pointer overflow-hidden shadow-lg"
                    >
                      {/* Mini Preview Window */}
                      {project?.previewType === 'video' && project?.videoFileName ? (
                        <div className="relative w-full">
                          <div className="bg-[#1c1c1e] border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                            </div>
                            <div className="flex-1 flex justify-center">
                              <span className="text-[11px] text-gray-500 font-mono truncate max-w-[200px]">
                                {project.title?.toLowerCase().replace(/\s+/g, '-')}.app
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewIndex(index);
                              }}
                              className="text-gray-500 hover:text-white transition-colors p-0.5 cursor-pointer"
                              title="Expand preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div
                            className="relative w-full aspect-[16/9] overflow-hidden bg-black/50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewIndex(index);
                            }}
                          >
                            <video
                              src={`/${project.videoFileName}`}
                              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-102 will-change-transform"
                              muted
                              playsInline
                              loop
                              autoPlay
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md rounded-full p-3">
                                <Eye className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : project?.imageUrl || project?.imageStoragePath ? (
                        <div className="relative w-full">
                          <div className="bg-[#1c1c1e] border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                              <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                            </div>
                            <div className="flex-1 flex justify-center">
                              <span className="text-[11px] text-gray-500 font-mono truncate max-w-[200px]">
                                {project.title?.toLowerCase().replace(/\s+/g, '-')}.app
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewIndex(index);
                              }}
                              className="text-gray-500 hover:text-white transition-colors p-0.5 cursor-pointer"
                              title="Expand preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div
                            className="relative w-full aspect-[16/9] overflow-hidden bg-black/50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewIndex(index);
                            }}
                          >
                            <img
                              src={project.imageUrl || project.imageStoragePath}
                              alt={`${project.title} preview`}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-102 will-change-transform"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md rounded-full p-3">
                                <Eye className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full">
                          <div className="bg-[#1c1c1e] border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-[#ff5f57]/40" />
                              <span className="w-3 h-3 rounded-full bg-[#febc2e]/40" />
                              <span className="w-3 h-3 rounded-full bg-[#28c840]/40" />
                            </div>
                            <div className="flex-1 flex justify-center">
                              <span className="text-[11px] text-slate-400 font-mono">preview</span>
                            </div>
                          </div>
                          <div className="w-full aspect-[16/9] bg-gradient-to-br from-white/[0.02] to-white/[0.005] flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                                <Code className="w-6 h-6 text-slate-400" />
                              </div>
                              <p className="text-slate-400 text-xs">Preview coming soon</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Project Info */}
                      <div className="p-8 relative z-10">
                        <div className="absolute top-8 right-8 text-xs text-blue-400 font-mono font-semibold">
                          {project?.year}
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                          {project?.title}
                        </h3>
                        <p className="text-slate-300 mb-6 leading-relaxed text-sm md:text-base">
                          {project?.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(project?.tech) ? project.tech : []).map((tech: string, tIndex: number) => (
                            <span
                              key={tIndex}
                              className="px-3.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300 font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                          {(project?.imageUrl ||
                            project?.imageStoragePath ||
                            (project?.previewType === 'video' && project?.videoFileName)) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewIndex(index);
                              }}
                              className="flex items-center gap-2 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                              Preview
                            </button>
                          )}
                          {project?.deployedUrl && (
                            <a
                              href={project.deployedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium hover:bg-blue-500/20 hover:border-blue-500/30 transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Live Demo
                            </a>
                          )}
                          {project?.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-300 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all"
                            >
                              <Github className="w-3.5 h-3.5" />
                              Source
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Preview Modal */}
              {previewIndex !== null && siteData.projects[previewIndex] && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
                  onClick={() => setPreviewIndex(null)}
                >
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/10 bg-[#1c1c1e] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-[#2a2a2e] border-b border-white/5 px-4 py-3 flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewIndex(null)}
                          className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition cursor-pointer"
                        />
                        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <span className="text-sm text-gray-400 font-medium truncate max-w-md">
                          {(siteData.projects[previewIndex] as any)?.title}
                        </span>
                      </div>
                      <button
                        onClick={() => setPreviewIndex(null)}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="overflow-auto max-h-[calc(90vh-48px)]">
                      {(siteData.projects[previewIndex] as any)?.previewType === 'video' &&
                      (siteData.projects[previewIndex] as any)?.videoFileName ? (
                        <video
                          src={`/${(siteData.projects[previewIndex] as any).videoFileName}`}
                          className="w-full h-auto will-change-transform"
                          controls
                          autoPlay
                          muted
                          playsInline
                          loop
                        />
                      ) : (siteData.projects[previewIndex] as any)?.imageUrl ||
                        (siteData.projects[previewIndex] as any)?.imageStoragePath ? (
                        <img
                          src={
                            (siteData.projects[previewIndex] as any).imageUrl ||
                            (siteData.projects[previewIndex] as any).imageStoragePath
                          }
                          alt={(siteData.projects[previewIndex] as any)?.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto will-change-transform"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                          No preview available
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="min-h-screen container mx-auto px-6 py-20 md:py-32 flex items-center justify-center">
              <div className="max-w-4xl w-full">
                <MagneticButton
                  onClick={() => setActiveSection('home')}
                  className="text-gray-400 hover:text-white mb-12 flex items-center gap-2 transition-colors text-sm uppercase tracking-wider"
                >
                  ← Back
                </MagneticButton>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
                  <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">Let's Work Together</h2>
                  <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto">
                    Have a project in mind? I'd love to hear about it. Get in touch and let's create something amazing.
                  </p>

                  <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {(Array.isArray(siteData.contacts) ? siteData.contacts : []).map((item: any, i: number) => {
                      const IconComponent =
                        {
                          Mail: Mail,
                          Linkedin: Linkedin,
                          Github: Github,
                          Globe: Globe,
                          Rocket: Rocket,
                        }[item.iconType as string] || Mail;

                      return (
                        <div
                          key={item.id || i}
                          onClick={() => {
                            if (item.url)
                              window.open(
                                item.url.startsWith('mailto:')
                                  ? item.url
                                  : item.url.startsWith('http')
                                  ? item.url
                                  : `https://${item.url}`,
                                '_blank',
                              );
                          }}
                          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all cursor-pointer group"
                        >
                          <div className="text-blue-400 mb-3 flex justify-center group-hover:scale-110 transition-transform">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="text-slate-400 text-sm mb-1">{item.platform}</div>
                          <div className="text-white font-medium truncate px-2">{item.value}</div>
                        </div>
                      );
                    })}
                  </div>

                  <MagneticButton
                    onClick={() => {
                      const emailContact = (siteData.contacts || []).find((c: any) => c.id === 'email');
                      window.location.href = emailContact?.url || 'mailto:kushaln.24.27@gmail.com';
                    }}
                    className="px-12 py-5 bg-white text-black rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-white/20 transition-all inline-flex items-center gap-3"
                  >
                    Send Message
                    <ArrowRight className="w-5 h-5" />
                  </MagneticButton>
                </motion.div>
              </div>
            </div>
          )}

          {activeSection === 'admin' && (
            <div className="min-h-screen container mx-auto px-6 py-20 md:py-32">
              <React.Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-400">Loading admin...</div>}>
                <AdminDashboard siteData={siteData} setSiteData={setSiteData} onClose={() => setActiveSection('home')} />
              </React.Suspense>
            </div>
          )}
        </PageTransition>
      </div>

      {/* macOS Style Dock */}
      <Dock items={dockItems} />
    </div>
  );
}
