import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Dock } from './components/Dock';
import { Intro3D } from './components/Intro3D';
import { SwordSlash } from './components/SwordSlash';
import { ScrollSection, ParallaxSection, RotateSection } from './components/ScrollSection';
import { PageTransition } from './components/PageTransition';
import { GrainOverlay } from './components/GrainOverlay';
import { AnimatedBackground } from './components/AnimatedBackground';
import { MagneticButton } from './components/MagneticButton';
import { LinkedInOcto, GitHubOcto, ProjectsOcto, AboutOcto, ContactOcto } from './components/DockIcons';
import { AdminDashboard } from './components/AdminDashboard';
import { WaterFrame } from './components/WaterFrame';
import { Code, Sparkles, Rocket, ArrowRight, Mail, Linkedin, Github, Eye, X as XIcon, ExternalLink, Globe, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a70c1202`;

type Section = 'home' | 'about' | 'projects' | 'contact' | 'admin';


// Error Boundary to prevent lottie-react crashes from taking down the whole app
class LottieErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="w-10 h-10 rounded-full bg-white/10" />;
    return this.props.children;
  }
}

// Fetches a Lottie JSON from a signed URL or uses local data
function LottieDockIcon({ signedUrl, localData }: { signedUrl?: string; localData?: any }) {
  const [animData, setAnimData] = useState<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (localData) { setAnimData(localData); return; }
    if (!signedUrl) { setFailed(true); return; }
    fetch(signedUrl)
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then(data => { if (data && typeof data === 'object') setAnimData(data); else setFailed(true); })
      .catch(() => setFailed(true));
  }, [signedUrl, localData]);

  if (failed) return <div className="w-10 h-10 rounded-full bg-white/10" />;
  if (!animData) return <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />;
  return (
    <LottieErrorBoundary>
      <div className="w-10 h-10 flex items-center justify-center">
        <Lottie animationData={animData} loop autoplay style={{ width: '100%', height: '100%' }} />
      </div>
    </LottieErrorBoundary>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [showSwordSlash, setShowSwordSlash] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const [siteData, setSiteData] = useState({
    hero: {
      welcome: 'Welcome to my Portfolio',
      name: 'KUSHAL N',
      subtitle: 'Creative Developer & Designer',
      description: 'Crafting unique digital experiences with cutting-edge technologies. Specializing in creating stunning interfaces that blend creativity with functionality.',
      imageUrl: '',
      imageStoragePath: '',
    },
    projects: [
      {
        title: 'E-Commerce Platform',
        description: 'A modern e-commerce solution featuring real-time inventory, seamless checkout, and advanced analytics.',
        tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
        year: '2024',
        deployedUrl: '',
        githubUrl: '',
      },
      {
        title: 'Social Dashboard',
        description: 'Comprehensive analytics platform for managing multiple social media accounts with AI-powered insights.',
        tech: ['Next.js', 'TypeScript', 'GraphQL', 'OpenAI'],
        year: '2024',
        deployedUrl: '',
        githubUrl: '',
      },
      {
        title: 'Creative Studio Portfolio',
        description: 'Award-winning portfolio website with stunning 3D interactions and smooth page transitions.',
        tech: ['React', 'Three.js', 'GSAP', 'Tailwind'],
        year: '2023',
        deployedUrl: '',
        githubUrl: '',
      },
      {
        title: 'SaaS Platform',
        description: 'Enterprise-grade SaaS solution with advanced features, team collaboration, and real-time updates.',
        tech: ['Next.js', 'Supabase', 'Stripe', 'Vercel'],
        year: '2023',
        deployedUrl: '',
        githubUrl: '',
      },
    ],
    dockIcons: [
      { id: 'linkedin', type: 'LinkedInOcto', label: 'LinkedIn', url: 'https://linkedin.com/in/yourprofile', action: '' },
      { id: 'github', type: 'GitHubOcto', label: 'GitHub', url: 'https://github.com/yourprofile', action: '' },
      { id: 'projects', type: 'ProjectsOcto', label: 'Projects', url: '', action: 'projects' },
      { id: 'about', type: 'AboutOcto', label: 'About Me', url: '', action: 'about' },
      { id: 'contact', type: 'ContactOcto', label: 'Contact', url: '', action: 'contact' },
    ],
    about: {
      paragraph1: "I'm a passionate creative developer dedicated to crafting exceptional digital experiences that seamlessly blend form and function.",
      paragraph2: "With years of experience in web development and design, I specialize in creating immersive, user-centric interfaces using cutting-edge technologies.",
      paragraph3: "My approach combines technical expertise with creative vision, ensuring every project not only meets but exceeds expectations.",
      skills: 'React, TypeScript, Next.js, Node.js, Tailwind CSS, Motion, Three.js, GraphQL, PostgreSQL, AWS, Docker, Figma',
    },
    cta: {
      heading: "Let's Create Something",
      highlight: 'Extraordinary',
      subtext: "Ready to bring your vision to life? Let's collaborate and build something amazing together.",
    },
    contacts: [
      { id: 'email', platform: 'Email', value: 'hello@kushaln.com', url: 'mailto:hello@kushaln.com', iconType: 'Mail' },
      { id: 'linkedin', platform: 'LinkedIn', value: '/in/kushaln', url: 'https://linkedin.com/in/kushaln', iconType: 'Linkedin' },
      { id: 'github', platform: 'GitHub', value: '@kushaln', url: 'https://github.com/kushaln', iconType: 'Github' },
    ],
  });

  useEffect(() => {
    // Fetch site data
    fetch(`${SERVER_URL}/sitedata`, {
      headers: { 'Authorization': `Bearer ${publicAnonKey}` }
    })
      .then(res => res.json())
      .then(res => {
        if (res.data && typeof res.data === 'object') {
          // Merge fetched data to ensure defaults remain for missing keys
          setSiteData(prev => {
            // Filter out the hero proxy and extract its signed URL
            let heroSignedUrl = res.data.hero?.imageUrl;
            let cleanProjects = Array.isArray(res.data.projects) ? res.data.projects : prev.projects;
            
            if (Array.isArray(res.data.projects)) {
              const proxy = res.data.projects.find((p: any) => p._heroProxy);
              if (proxy && proxy.imageUrl) {
                heroSignedUrl = proxy.imageUrl;
              }
              cleanProjects = res.data.projects.filter((p: any) => !p._heroProxy);
            }

            return {
              ...prev,
              ...res.data,
              hero: { ...prev.hero, ...(res.data.hero || {}), imageUrl: heroSignedUrl || res.data.hero?.imageUrl || prev.hero.imageUrl },
              projects: cleanProjects,
              dockIcons: Array.isArray(res.data.dockIcons) ? res.data.dockIcons : prev.dockIcons,
            };
          });
        }
      })
      .catch(err => console.error('Failed to fetch site data:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400">Loading experience...</p>
      </div>
    );
  }

  const preloader = (
    <div style={{ display: 'none' }} aria-hidden="true">
      {(siteData.hero?.imageUrl || siteData.hero?.imageStoragePath) && (
        <img src={siteData.hero.imageUrl || siteData.hero.imageStoragePath} alt="" />
      )}
      {(Array.isArray(siteData.projects) ? siteData.projects : []).map((p: any, i: number) => (
        (p?.imageUrl || p?.imageStoragePath) && <img key={i} src={p.imageUrl || p.imageStoragePath} alt="" />
      ))}
    </div>
  );

  if (showSwordSlash) {
    return (
      <>
        {preloader}
        <SwordSlash onComplete={() => {
          setShowSwordSlash(false);
          setShowIntro(true);
        }} />
      </>
    );
  }

  if (showIntro) {
    return (
      <>
        {preloader}
        <Intro3D onComplete={() => setShowIntro(false)} />
      </>
    );
  }

  const iconComponents: Record<string, React.ReactNode> = {
    LinkedInOcto: <LinkedInOcto />,
    GitHubOcto: <GitHubOcto />,
    ProjectsOcto: <ProjectsOcto />,
    AboutOcto: <AboutOcto />,
    ContactOcto: <ContactOcto />,
    AdminOcto: <ShieldCheck className="w-6 h-6 text-blue-400" />,
  };

  const dockItems = [
    ...(Array.isArray(siteData.dockIcons) ? siteData.dockIcons : []).map((icon: any) => ({
      id: icon?.id || Math.random().toString(),
      icon: icon?.type === 'CustomImage' && (icon?.customIconData || icon?.storagePath || icon?.lottieData)
        ? (icon?.isLottie || icon?.lottieData)
          ? <LottieDockIcon signedUrl={icon.isLottie ? icon.customIconData : undefined} localData={icon.lottieData} />
          : <div className="w-10 h-10 flex items-center justify-center"><img src={icon.customIconData || icon.storagePath} alt={icon.label || 'Custom'} className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" /></div>
        : (icon?.type && iconComponents[icon.type]) ? iconComponents[icon.type] : <ProjectsOcto />,
      label: icon?.label || '',
      onClick: () => {
        if (icon?.url) {
          window.open(icon.url, '_blank');
        } else if (icon?.action) {
          setActiveSection(icon.action as Section);
        }
      },
    })),
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] overflow-x-hidden">

      {/* Grain Texture */}
      <GrainOverlay />
      
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Logo */}

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
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-6xl md:text-8xl lg:text-9xl font-bold text-slate-50 mb-6 tracking-tight leading-none"
                    >
                      {siteData.hero.name}
                    </motion.h1>

                    <motion.h2
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="text-2xl md:text-4xl lg:text-5xl text-slate-300 mb-8 font-light"
                    >
                      {siteData.hero.subtitle}
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                      className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed"
                    >
                      {siteData.hero.description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1 }}
                      className="flex flex-wrap gap-4"
                    >
                      <MagneticButton 
                        variant="primary"
                        onClick={() => setActiveSection('projects')}
                      >
                        View My Work
                        <ArrowRight className="w-5 h-5" />
                      </MagneticButton>
                      <MagneticButton 
                        variant="ghost"
                        onClick={() => setActiveSection('contact')}
                      >
                        Get in Touch
                      </MagneticButton>
                    </motion.div>
                  </div>

                  {(siteData.hero?.imageUrl || siteData.hero?.imageStoragePath) ? (
                    <div className="flex-1 w-full flex justify-center md:justify-end mt-12 md:mt-0">
                      <WaterFrame imageUrl={siteData.hero.imageUrl || siteData.hero.imageStoragePath} />
                    </div>
                  ) : null}
                </div>
              </section>


              {/* Feature Sections */}
              <section className="container mx-auto px-6 py-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[
                    { 
                      icon: <Code className="w-16 h-16" />, 
                      title: 'Clean Code', 
                      desc: 'Building maintainable and scalable solutions with best practices',
                      delay: 0.2
                    },
                    { 
                      icon: <Sparkles className="w-16 h-16" />, 
                      title: 'Creative Design', 
                      desc: 'Crafting beautiful interfaces with attention to detail',
                      delay: 0.4
                    },
                    { 
                      icon: <Rocket className="w-16 h-16" />, 
                      title: 'Performance', 
                      desc: 'Optimized for blazing-fast speed and efficiency',
                      delay: 0.6
                    }
                  ].map((feature, i) => (
                    <ScrollSection key={i}>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: feature.delay }}
                        className="group relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500"
                      >
                        <div className="text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-500">
                          {feature.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-50 mb-3">{feature.title}</h3>
                        <p className="text-slate-300 leading-relaxed">{feature.desc}</p>
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
                      </motion.div>
                    </ScrollSection>
                  ))}
                </div>
              </section>

              {/* CTA Section */}
              <section className="container mx-auto px-6 py-32">
                <RotateSection>
                  <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="relative p-12 md:p-16 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-60" />
                      <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold text-slate-50 mb-6">
                          {siteData.cta?.heading || "Let's Create Something"}
                          <br />
                          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            {siteData.cta?.highlight || 'Extraordinary'}
                          </span>
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                          {siteData.cta?.subtext || "Ready to bring your vision to life? Let's collaborate and build something amazing together."}
                        </p>
                      </div>
                    </motion.div>
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

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-5xl md:text-7xl font-bold text-slate-50 mb-8">About Me</h2>
                  
                  <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-light">
                      <p>{siteData.about?.paragraph1 || "I'm a passionate creative developer dedicated to crafting exceptional digital experiences."}</p>
                      <p>{siteData.about?.paragraph2 || 'With years of experience in web development and design, I specialize in creating immersive, user-centric interfaces.'}</p>
                      <p>{siteData.about?.paragraph3 || 'My approach combines technical expertise with creative vision, ensuring every project exceeds expectations.'}</p>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4 uppercase tracking-wider">Expertise</h3>
                        <div className="space-y-3">
                          {[
                            { skill: 'Frontend Development', level: 95 },
                            { skill: 'UI/UX Design', level: 90 },
                            { skill: 'Backend Development', level: 85 },
                            { skill: 'Motion Design', level: 88 },
                          ].map((item) => (
                            <div key={item.skill}>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400 font-medium">{item.skill}</span>
                                <span className="text-blue-400 font-bold">{item.level}%</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${item.level}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.5, delay: 0.2, ease: "circOut" }}
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
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
                      {(siteData.about?.skills || 'React, TypeScript, Next.js, Node.js, Tailwind CSS, Motion, Three.js, GraphQL, PostgreSQL, AWS, Docker, Figma').split(',').map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          whileHover={{ scale: 1.1, y: -5 }}
                          className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-32 flex justify-center opacity-20 hover:opacity-100 transition-opacity duration-500">
                    <button
                      onClick={() => setActiveSection('admin')}
                      className="cursor-pointer p-4 group flex flex-col items-center gap-2 rounded-full hover:bg-white/5 transition-colors"
                      aria-label="Admin Access"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-white transition-colors">
                        <path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path>
                        <path d="M13 19l6-6"></path>
                        <path d="M16 16l4 4"></path>
                        <path d="M19 21l2-2"></path>
                      </svg>
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
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-5xl md:text-7xl font-bold text-slate-50 mb-16"
                >
                  Selected Works
                </motion.h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {(Array.isArray(siteData.projects) ? siteData.projects : []).map((project: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                      className="group relative rounded-2xl border border-white/8 bg-white/5 hover:bg-white/8 hover:border-white/15 backdrop-blur-sm transition-all duration-500 cursor-pointer overflow-hidden shadow-sm"
                    >
                      {/* Mini Preview Window */}
                      {(project?.imageUrl || project?.imageStoragePath) && (
                        <div className="relative w-full">
                          {/* macOS-style window chrome */}
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
                              onClick={(e) => { e.stopPropagation(); setPreviewIndex(index); }}
                              className="text-gray-500 hover:text-white transition-colors p-0.5 cursor-pointer"
                              title="Expand preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {/* Preview image */}
                          <div
                            className="relative w-full aspect-[16/9] overflow-hidden bg-black/50"
                            onClick={(e) => { e.stopPropagation(); setPreviewIndex(index); }}
                          >
                            <img
                              src={project.imageUrl || project.imageStoragePath}
                              alt={`${project.title} preview`}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 will-change-transform"
                            />
                            {/* Hover expand overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ opacity: 1, scale: 1 }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md rounded-full p-3"
                              >
                                <Eye className="w-5 h-5 text-white" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* No image placeholder */}
                      {!(project?.imageStoragePath || project?.imageUrl) && (
                        <div className="w-full">
                          <div className="bg-[#1c1c1e] border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded-full bg-[#ff5f57]/40" />
                              <span className="w-3 h-3 rounded-full bg-[#febc2e]/40" />
                              <span className="w-3 h-3 rounded-full bg-[#28c840]/40" />
                            </div>
                            <div className="flex-1 flex justify-center">
                              <span className="text-[11px] text-slate-300 font-mono">preview</span>
                            </div>
                          </div>
                          <div className="w-full aspect-[16/9] bg-gradient-to-br from-white/[0.02] to-white/[0.005] flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                                <Code className="w-6 h-6 text-slate-300" />
                              </div>
                              <p className="text-slate-300 text-xs">No preview uploaded</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Project Info */}
                      <div className="p-8 relative z-10">
                        {/* Year badge */}
                        <div className="absolute top-8 right-8 text-xs text-slate-300 font-mono">
                          {project?.year}
                        </div>

                        <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                          {project?.title}
                        </h3>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                          {project?.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(project?.tech) ? project.tech : []).map((tech: string, tIndex: number) => (
                            <span
                              key={tIndex}
                              className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        
                        {/* Action buttons */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                          {(project?.imageUrl || project?.imageStoragePath) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setPreviewIndex(index); }}
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

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none rounded-2xl" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Full Preview Modal */}
              {previewIndex !== null && siteData.projects[previewIndex] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
                  onClick={() => setPreviewIndex(null)}
                >
                  {/* Backdrop */}
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

                  {/* Modal Window */}
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/10 bg-[#1c1c1e] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Window chrome */}
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
                        <span className="text-sm text-gray-400 font-medium">
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

                    {/* Image */}
                    <div className="overflow-auto max-h-[calc(90vh-48px)]">
                      {((siteData.projects[previewIndex] as any)?.imageUrl || (siteData.projects[previewIndex] as any)?.imageStoragePath) ? (
                        <img
                          src={(siteData.projects[previewIndex] as any).imageUrl || (siteData.projects[previewIndex] as any).imageStoragePath}
                          alt={(siteData.projects[previewIndex] as any)?.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-auto will-change-transform"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                          No preview image available
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
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

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
                >
                  <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
                    Let's Work Together
                  </h2>
                  <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto">
                    Have a project in mind? I'd love to hear about it. Get in touch and let's create something amazing.
                  </p>

                  <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {(Array.isArray(siteData.contacts) ? siteData.contacts : []).map((item: any, i: number) => {
                      const IconComponent = {
                        Mail: Mail,
                        Linkedin: Linkedin,
                        Github: Github,
                        Globe: Globe,
                        Rocket: Rocket
                      }[item.iconType as string] || Mail;

                      return (
                        <motion.div
                          key={item.id || i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          onClick={() => {
                            if (item.url) window.open(item.url.startsWith('mailto:') ? item.url : (item.url.startsWith('http') ? item.url : `https://${item.url}`), '_blank');
                          }}
                          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-pointer group"
                        >
                          <div className="text-blue-400 mb-3 flex justify-center group-hover:scale-110 transition-transform">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="text-slate-300 text-sm mb-1">{item.platform}</div>
                          <div className="text-white font-medium truncate px-2">{item.value}</div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <MagneticButton
                    onClick={() => {
                      const emailContact = (siteData.contacts || []).find((c: any) => c.id === 'email');
                      window.location.href = emailContact?.url || 'mailto:hello@kushaln.com';
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
              <AdminDashboard 
                siteData={siteData} 
                setSiteData={setSiteData} 
                onClose={() => setActiveSection('home')} 
              />
            </div>
          )}
        </PageTransition>
      </div>

      {/* macOS Style Dock */}
      <Dock items={dockItems} />
    </div>
  );
}

