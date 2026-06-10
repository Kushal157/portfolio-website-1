import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  X,
  Plus,
  Trash2,
  Save,
  LogIn,
  Loader,
  CheckCircle,
} from "lucide-react";
import { MagneticButton } from "./MagneticButton";
import { createClient } from "@supabase/supabase-js";
import {
  projectId,
  publicAnonKey,
} from "../../../utils/supabase/info";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);
const SERVER_URL = `${supabaseUrl}/functions/v1/make-server-a70c1202`;

// Helper: always include anon key for Supabase gateway
const authHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${publicAnonKey}`,
  "Content-Type": "application/json",
});

interface AdminDashboardProps {
  siteData: any;
  setSiteData: (data: any) => void;
  onClose: () => void;
}

export function AdminDashboard({
  siteData,
  setSiteData,
  onClose,
}: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState(() =>
    JSON.parse(JSON.stringify(siteData)),
  );

  // Sync formData when siteData changes externally
  useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(siteData)));
  }, [siteData]);

  // Check session on mount and ensure admin exists
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        setAccessToken(session.access_token);
      }
    });

    // Ensure admin user exists
    fetch(`${SERVER_URL}/setup-admin`, {
      method: "POST",
      headers: authHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error)
          console.error("Setup Admin Error:", data.error);
      })
      .catch(console.error);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      const u = username.trim();
      const p = password.trim();

      if (!u || !p) {
        setError("Please enter both username and password.");
        setIsLoggingIn(false);
        return;
      }

      const email = `${u.toLowerCase()}@admin.com`;

      // Attempt login
      let { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password: p,
        });

      if (signInError) {
        console.log(
          "First login attempt failed:",
          signInError.message,
        );

        // Try re-creating/updating admin then retry
        try {
          await fetch(`${SERVER_URL}/setup-admin`, {
            method: "POST",
            headers: authHeaders(),
          });
        } catch (e) {
          console.warn("Setup admin retry failed:", e);
        }

        // Retry login
        const retry = await supabase.auth.signInWithPassword({
          email,
          password: p,
        });
        if (retry.error) {
          // Hardcoded credential check as last resort for prototype
          if (u === "PORT2026" && p === "Resume2026") {
            console.warn(
              "Auth service unavailable, using prototype bypass",
            );
            setIsAuthenticated(true);
            setAccessToken(null);
            setIsLoggingIn(false);
            return;
          }
          throw retry.error;
        }
        data = retry.data;
      }

      setAccessToken(data?.session?.access_token || null);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error("Login error:", err);
      const errMsg =
        err.message === "Invalid login credentials"
          ? "Invalid username or password."
          : err.message;
      setError(errMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const updateDockIconField = (index: number, field: string, value: string) => {
    const newDockIcons = [...(formData.dockIcons || [])];
    newDockIcons[index] = { ...newDockIcons[index], [field]: value };
    setFormData({ ...formData, dockIcons: newDockIcons });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Deep clone for saving
      const dataToSave = JSON.parse(JSON.stringify(formData));

      // Strip lottieData only (too large, lives in local state). Keep customIconData for persistence.
      if (Array.isArray(dataToSave.dockIcons)) {
        dataToSave.dockIcons = dataToSave.dockIcons.map(
          (icon: any) => {
            const { lottieData, ...iconWithoutLottie } = icon;
            return iconWithoutLottie;
          },
        );
      }
      // Strip hero image base64 data - only keep imageStoragePath
      if (dataToSave.hero?.imageStoragePath) {
        const { imageUrl, ...rest } = dataToSave.hero;
        dataToSave.hero = rest;
      }

      // Strip project image base64 data - only keep imageStoragePath and clean up tech stack
      if (Array.isArray(dataToSave.projects)) {
        dataToSave.projects = dataToSave.projects.map(
          (p: any) => {
            // Clean up tech stack array (trim and remove empty values)
            const tech = Array.isArray(p.tech)
              ? p.tech.map((t: string) => t.trim()).filter(Boolean)
              : p.tech;

            if (p.imageStoragePath) {
              const { imageUrl, ...rest } = p;
              return { ...rest, tech };
            }
            return { ...p, tech };
          },
        );
      }

      // WORKAROUND: Edge function bug forgets to sign the `hero` image URL.
      // Trick the edge function into signing it by appending it as a hidden project.
      if (dataToSave.hero?.imageStoragePath) {
        if (!Array.isArray(dataToSave.projects)) {
          dataToSave.projects = [];
        }
        dataToSave.projects = dataToSave.projects.filter((p: any) => !p._heroProxy);
        dataToSave.projects.push({
          _heroProxy: true,
          imageStoragePath: dataToSave.hero.imageStoragePath
        });
      }

      // Check payload size
      const payloadString = JSON.stringify(dataToSave);
      if (payloadString.length > 55000) {
        // Force-strip all image data
        if (Array.isArray(dataToSave.dockIcons)) {
          dataToSave.dockIcons = dataToSave.dockIcons.map(
            (icon: any) => {
              const { customIconData, ...rest } = icon;
              return rest;
            },
          );
        }
        if (dataToSave.hero) {
          const { imageUrl, ...rest } = dataToSave.hero;
          dataToSave.hero = rest;
        }
        if (Array.isArray(dataToSave.projects)) {
          dataToSave.projects = dataToSave.projects.map(
            (p: any) => {
              const { imageUrl, ...rest } = p;
              return rest;
            },
          );
        }
        const finalPayload = JSON.stringify(dataToSave);
        if (finalPayload.length > 55000) {
          throw new Error(
            "Content is too large. Please shorten project descriptions.",
          );
        }
      }

      // Build headers: Authorization = anon key (for gateway), X-Access-Token = user JWT (for auth)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      };

      if (accessToken) {
        headers["X-Access-Token"] = accessToken;
      }

      console.log("Saving site data...", {
        payloadSize: payloadString.length,
      });

      const response = await fetch(`${SERVER_URL}/sitedata`, {
        method: "POST",
        headers,
        body: JSON.stringify(dataToSave),
      });

      const responseText = await response.text();
      console.log(
        "Save response:",
        response.status,
        responseText,
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          throw new Error(
            responseText ||
              `Server returned status ${response.status}`,
          );
        }
        throw new Error(
          errorData?.error ||
            `Server returned status ${response.status}`,
        );
      }

      // Update parent state with the full formData (which has local previews)
      setSiteData(JSON.parse(JSON.stringify(formData)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      alert(`Error saving: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setAccessToken(null);
    setUsername("");
    setPassword("");
  };

  const updateHeroField = useCallback(
    (key: string, value: string) => {
      setFormData((prev: any) => ({
        ...prev,
        hero: { ...prev.hero, [key]: value },
      }));
    },
    [],
  );

  const updateAboutField = useCallback(
    (key: string, value: string) => {
      setFormData((prev: any) => ({
        ...prev,
        about: { ...(prev.about || {}), [key]: value },
      }));
    },
    [],
  );

  const updateCTAField = useCallback(
    (key: string, value: string) => {
      setFormData((prev: any) => ({
        ...prev,
        cta: { ...(prev.cta || {}), [key]: value },
      }));
    },
    [],
  );

  const updateContactField = useCallback(
    (index: number, field: string, value: any) => {
      setFormData((prev: any) => {
        const newContacts = (prev.contacts || []).map(
          (c: any, i: number) =>
            i === index ? { ...c, [field]: value } : c,
        );
        return { ...prev, contacts: newContacts };
      });
    },
    [],
  );

  const updateProject = useCallback(
    (index: number, field: string, value: any) => {
      setFormData((prev: any) => {
        const newProjects = prev.projects.map(
          (p: any, i: number) =>
            i === index ? { ...p, [field]: value } : p,
        );
        return { ...prev, projects: newProjects };
      });
    },
    [],
  );

  const addProject = useCallback(() => {
    setFormData((prev: any) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        {
          title: "New Project",
          description: "Project description here...",
          tech: ["React"],
          year: new Date().getFullYear().toString(),
          deployedUrl: "",
          githubUrl: "",
        },
      ],
    }));
  }, []);

  const removeProject = useCallback((index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      projects: prev.projects.filter(
        (_: any, i: number) => i !== index,
      ),
    }));
  }, []);

  const handleProjectImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Please choose an image under 10 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;

      try {
        const uploadRes = await fetch(`${SERVER_URL}/upload`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            fileData: base64,
            fileName: `project-${index}-${file.name}`,
            contentType: file.type,
          }),
        });

        const uploadData = await uploadRes.json();

        if (uploadData.path) {
          setFormData((prev: any) => {
            const newProjects = prev.projects.map(
              (p: any, i: number) =>
                i === index
                  ? {
                      ...p,
                      imageUrl: base64,
                      imageStoragePath: uploadData.path,
                    }
                  : p,
            );
            return { ...prev, projects: newProjects };
          });
        } else {
          alert(uploadData.error || "Failed to upload image.");
        }
      } catch (err) {
        console.error("Project image upload error:", err);
        alert("Failed to upload project image.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Please choose an image under 10 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const uploadRes = await fetch(`${SERVER_URL}/upload`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            fileData: base64,
            fileName: `hero-${file.name}`,
            contentType: file.type,
          }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.path) {
          setFormData((prev: any) => ({
            ...prev,
            hero: {
              ...prev.hero,
              imageUrl: base64,
              imageStoragePath: uploadData.path,
            }
          }));
        } else {
          alert(uploadData.error || "Failed to upload hero image.");
        }
      } catch (err) {
        console.error("Hero image upload error:", err);
        alert("Failed to upload hero image.");
      }
    };
    reader.readAsDataURL(file);
  };

  const updateDockIcon = useCallback(
    (index: number, field: string, value: any) => {
      setFormData((prev: any) => {
        const newIcons = prev.dockIcons.map(
          (icon: any, i: number) =>
            i === index ? { ...icon, [field]: value } : icon,
        );
        return { ...prev, dockIcons: newIcons };
      });
    },
    [],
  );

  const addDockIcon = useCallback(() => {
    setFormData((prev: any) => ({
      ...prev,
      dockIcons: [
        ...(prev.dockIcons || []),
        {
          id: "new-" + Date.now(),
          type: "ProjectsOcto",
          label: "New Icon",
          url: "",
          action: "",
        },
      ],
    }));
  }, []);

  const removeDockIcon = useCallback((index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      dockIcons: prev.dockIcons.filter(
        (_: any, i: number) => i !== index,
      ),
    }));
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Please choose an image under 10 MB.");
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/svg+xml",
      "image/gif",
      "application/json",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPEG, SVG, GIF, and JSON (Lottie) files are allowed.");
      return;
    }

    // Handle JSON (Lottie) — upload to storage for persistence
    if (file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          const json = JSON.parse(text); // validate it's proper JSON
          // Upload to storage as base64-encoded text
          const base64 = `data:application/json;base64,${btoa(unescape(encodeURIComponent(text)))}`;
          const uploadRes = await fetch(`${SERVER_URL}/upload`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
              fileData: base64,
              fileName: file.name,
              contentType: "application/json",
            }),
          });
          const uploadData = await uploadRes.json();
          if (uploadData.path) {
            setFormData((prev: any) => {
              const newIcons = prev.dockIcons.map(
                (icon: any, i: number) =>
                  i === index
                    ? { ...icon, type: "CustomImage", lottieData: json, storagePath: uploadData.path, isLottie: true, customIconData: null }
                    : icon,
              );
              return { ...prev, dockIcons: newIcons };
            });
          } else {
            // Fallback: store in local state only
            setFormData((prev: any) => {
              const newIcons = prev.dockIcons.map(
                (icon: any, i: number) =>
                  i === index
                    ? { ...icon, type: "CustomImage", lottieData: json, isLottie: true, customIconData: null, storagePath: null }
                    : icon,
              );
              return { ...prev, dockIcons: newIcons };
            });
            alert("Could not upload Lottie to storage — animation will only work this session.");
          }
        } catch {
          alert("Invalid JSON / Lottie file.");
        }
      };
      reader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;

      try {
        const uploadRes = await fetch(`${SERVER_URL}/upload`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            fileData: base64,
            fileName: file.name,
            contentType: file.type,
          }),
        });

        const uploadData = await uploadRes.json();
        console.log("Upload result:", uploadData);

        if (uploadData.path) {
          setFormData((prev: any) => {
            const newIcons = prev.dockIcons.map(
              (icon: any, i: number) =>
                i === index
                  ? {
                      ...icon,
                      type: "CustomImage",
                      customIconData: base64,
                      storagePath: uploadData.path,
                    }
                  : icon,
            );
            return { ...prev, dockIcons: newIcons };
          });
        } else {
          alert(uploadData.error || "Failed to upload image.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert(
          "Failed to upload image. Check console for details.",
        );
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Admin Access
        </h2>
        <p className="text-gray-400 mb-8 text-center text-sm">
          Enter your unique ID and password
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors mb-4"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            {isLoggingIn ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoggingIn ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 rounded-2xl border border-white/10 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Site Dashboard
          </h2>
          <p className="text-gray-400 text-sm">
            Customize your portfolio content
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors mr-2 cursor-pointer"
          >
            Logout
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 ${saveSuccess ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"} text-white rounded-lg font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50`}
          >
            {isSaving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving
              ? "Saving..."
              : saveSuccess
                ? "Saved!"
                : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="space-y-12 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
        {/* Hero Texts Section */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
            Hero Texts
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.keys(formData.hero || {}).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  {key}
                </label>
                {key === "description" ? (
                  <textarea
                    value={formData.hero?.[key] || ""}
                    onChange={(e) =>
                      updateHeroField(key, e.target.value)
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors h-32 resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.hero?.[key] || ""}
                    onChange={(e) =>
                      updateHeroField(key, e.target.value)
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl">
            <label className="block text-sm font-medium text-blue-300 mb-2">
              Hero Profile Image (PNG, JPG)
            </label>
            <div className="flex flex-col gap-4">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleHeroImageUpload}
                className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-colors cursor-pointer"
              />
              {(formData.hero?.imageStoragePath || formData.hero?.imageUrl) && (
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20">
                  <img src={formData.hero.imageStoragePath || formData.hero.imageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                </div>
              )}
              {formData.hero?.imageStoragePath && (
                <p className="text-xs text-green-400">✓ Image uploaded securely</p>
              )}
            </div>
          </div>
        </section>

        {/* About Me Section */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
            About Me Section
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                Paragraph 1
              </label>
              <textarea
                value={formData.about?.paragraph1 || ""}
                onChange={(e) => updateAboutField("paragraph1", e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                Paragraph 2
              </label>
              <textarea
                value={formData.about?.paragraph2 || ""}
                onChange={(e) => updateAboutField("paragraph2", e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                Paragraph 3
              </label>
              <textarea
                value={formData.about?.paragraph3 || ""}
                onChange={(e) => updateAboutField("paragraph3", e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                Skills (Comma Separated)
              </label>
              <input
                type="text"
                value={formData.about?.skills || ""}
                onChange={(e) => updateAboutField("skills", e.target.value)}
                placeholder="React, TypeScript, Next.js..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
            "Let's Work Together" Section
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                Main Heading
              </label>
              <input
                type="text"
                value={formData.cta?.heading || ""}
                onChange={(e) => updateCTAField("heading", e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                Highlight Word
              </label>
              <input
                type="text"
                value={formData.cta?.highlight || ""}
                onChange={(e) => updateCTAField("highlight", e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
              Subtext
            </label>
            <textarea
              value={formData.cta?.subtext || ""}
              onChange={(e) => updateCTAField("subtext", e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors h-24 resize-none"
            />
          </div>
        </section>

        {/* Contacts Section */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
            Contact Cards
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {(formData.contacts || []).map((contact: any, index: number) => (
              <div
                key={`contact-${index}`}
                className="p-6 rounded-xl border border-white/5 bg-white/[0.02] relative group"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={contact.platform || ""}
                      onChange={(e) => updateContactField(index, "platform", e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Display Value
                    </label>
                    <input
                      type="text"
                      value={contact.value || ""}
                      onChange={(e) => updateContactField(index, "value", e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      URL (Link)
                    </label>
                    <input
                      type="text"
                      value={contact.url || ""}
                      onChange={(e) => updateContactField(index, "url", e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Icon Type
                    </label>
                    <select
                      value={contact.iconType || "Mail"}
                      onChange={(e) => updateContactField(index, "iconType", e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                    >
                      <option value="Mail">Email / Mail</option>
                      <option value="Linkedin">LinkedIn</option>
                      <option value="Github">GitHub</option>
                      <option value="Globe">Website (Globe)</option>
                      <option value="Rocket">Project (Rocket)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dock Icons Section */}
        <section className="space-y-6">
          <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
            Dock Navigation Labels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(formData.dockIcons || []).map((icon: any, index: number) => (
              <div
                key={`dock-${index}`}
                className="p-4 rounded-xl border border-white/5 bg-white/[0.02]"
              >
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                  {icon.id} Icon Label
                </label>
                <input
                  type="text"
                  value={icon.label || ""}
                  onChange={(e) => updateDockIconField(index, "label", e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="text-xl font-semibold text-white">
              Projects ({(formData.projects || []).length})
            </h3>
            <button
              onClick={addProject}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>

          <div className="space-y-6">
            {(Array.isArray(formData.projects)
              ? formData.projects
              : []
            ).map((project: any, index: number) => (
              <div
                key={`project-${index}`}
                className="p-6 rounded-xl border border-white/5 bg-white/[0.02] relative group"
              >
                <button
                  onClick={() => removeProject(index)}
                  className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={project.title || ""}
                      onChange={(e) =>
                        updateProject(
                          index,
                          "title",
                          e.target.value,
                        )
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Year
                    </label>
                    <input
                      type="text"
                      value={project.year || ""}
                      onChange={(e) =>
                        updateProject(
                          index,
                          "year",
                          e.target.value,
                        )
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Description
                  </label>
                  <textarea
                    value={project.description || ""}
                    onChange={(e) =>
                      updateProject(
                        index,
                        "description",
                        e.target.value,
                      )
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 h-20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Deployed URL
                    </label>
                    <input
                      type="url"
                      value={project.deployedUrl || ""}
                      onChange={(e) =>
                        updateProject(
                          index,
                          "deployedUrl",
                          e.target.value,
                        )
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                      placeholder="https://myproject.vercel.app"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={project.githubUrl || ""}
                      onChange={(e) =>
                        updateProject(
                          index,
                          "githubUrl",
                          e.target.value,
                        )
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                      placeholder="https://github.com/user/repo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Technologies (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(Array.isArray(project.tech)
                      ? project.tech
                      : []
                    ).join(", ")}
                    onChange={(e) =>
                      updateProject(
                        index,
                        "tech",
                        e.target.value.split(","),
                      )
                    }
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                    placeholder="React, Node.js, Tailwind"
                  />
                </div>

                {/* Project Preview Image Upload */}
                <div className="mt-4 p-4 border border-purple-500/20 bg-purple-500/5 rounded-xl">
                  <label className="block text-xs font-medium text-purple-300 mb-2">
                    Project Preview Image (PNG, JPG - max 10 MB)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) =>
                        handleProjectImageUpload(e, index)
                      }
                      className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 transition-colors flex-1"
                    />
                    {(project.imageStoragePath || project.imageUrl) && (
                      <div className="w-24 h-14 rounded-lg bg-black/50 border border-white/10 overflow-hidden flex-shrink-0">
                        <img
                          src={project.imageStoragePath || project.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {project.imageStoragePath && (
                    <p className="text-xs text-green-400/60 mt-2">
                      Uploaded to storage
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dock Icons Section */}
        <section className="space-y-6 pb-8">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="text-xl font-semibold text-white">
              Dock Icons ({(formData.dockIcons || []).length})
            </h3>
            {formData.allowIconEdit && (
              <button
                onClick={addDockIcon}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Icon
              </button>
            )}
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <div>
              <h4 className="text-sm font-medium text-white">Enable Custom Dock Icons</h4>
              <p className="text-xs text-gray-400 mt-1">
                {formData.allowIconEdit
                  ? "Customizing dock icons. Admin updates will be displayed in the dock."
                  : "Loading default animated JSON icons from folder. Icon editing is disabled."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, allowIconEdit: !formData.allowIconEdit })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.allowIconEdit ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.allowIconEdit ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {formData.allowIconEdit ? (
            <div className="space-y-4">
              {(Array.isArray(formData.dockIcons)
                ? formData.dockIcons
                : []
              ).map((icon: any, index: number) => (
                <div
                  key={icon.id || `icon-${index}`}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={icon.label || ""}
                          onChange={(e) =>
                            updateDockIcon(
                              index,
                              "label",
                              e.target.value,
                            )
                          }
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Icon Type
                        </label>
                        <select
                          value={icon.type || "ProjectsOcto"}
                          onChange={(e) =>
                            updateDockIcon(
                              index,
                              "type",
                              e.target.value,
                            )
                          }
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 appearance-none"
                        >
                          <option value="LinkedInOcto">
                            LinkedIn
                          </option>
                          <option value="GitHubOcto">
                            GitHub
                          </option>
                          <option value="ProjectsOcto">
                            Projects
                          </option>
                          <option value="AboutOcto">About</option>
                          <option value="ContactOcto">
                            Contact
                          </option>
                          <option value="CustomImage">
                            Custom Image
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          URL (External)
                        </label>
                        <input
                          type="text"
                          value={icon.url || ""}
                          onChange={(e) =>
                            updateDockIcon(
                              index,
                              "url",
                              e.target.value,
                            )
                          }
                          placeholder="https://..."
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Action (Internal)
                        </label>
                        <select
                          value={icon.action || ""}
                          onChange={(e) =>
                            updateDockIcon(
                              index,
                              "action",
                              e.target.value,
                            )
                          }
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 appearance-none"
                        >
                          <option value="">None</option>
                          <option value="home">Home</option>
                          <option value="projects">
                            Projects
                          </option>
                          <option value="about">About</option>
                          <option value="contact">Contact</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => removeDockIcon(index)}
                      className="text-red-500/70 hover:text-red-500 p-2 cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {icon.type === "CustomImage" && (
                    <div className="mt-4 p-4 border border-blue-500/30 bg-blue-500/5 rounded-xl flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-blue-300 mb-2">
                          Upload Custom Icon (PNG, JPG, SVG, GIF, JSON/Lottie - max 10 MB)
                        </label>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/svg+xml, image/gif, application/json"
                          onChange={(e) =>
                            handleFileUpload(e, index)
                          }
                          className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-colors"
                        />
                      </div>
                      {(icon.storagePath || icon.customIconData) && (
                        <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={icon.storagePath || icon.customIconData}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
              <p className="text-sm text-gray-400">
                Dock icon custom editing is currently disabled. Toggle the option above to edit or upload custom icons.
              </p>
            </div>
          )}
        </section>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}