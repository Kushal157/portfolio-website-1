import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Access-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a70c1202/health", (c) => {
  return c.json({ status: "ok" });
});

// Setup admin endpoint (called from frontend to ensure user exists)
app.post("/make-server-a70c1202/setup-admin", async (c) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return c.json({ error: "Missing Supabase env vars" }, 500);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const targetEmail = 'port2026@admin.com';
    const targetPassword = 'Resume2026';
    
    // Create admin user using email trick for username
    const { data, error } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      user_metadata: { username: 'PORT2026' },
      email_confirm: true
    });
    
    if (error && (error.message.toLowerCase().includes('already') || error.status === 422)) {
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        return c.json({ error: "List users error: " + listError.message }, 500);
      }
      
      const existingUser = usersData.users?.find(u => u.email === targetEmail);
      
      if (existingUser) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
          password: targetPassword,
          email_confirm: true
        });
        
        if (updateError) {
          console.error("Error updating admin:", updateError);
          return c.json({ error: "Update error: " + updateError.message }, 400);
        }
      }
    } else if (error) {
      console.error("Error creating admin:", error);
      return c.json({ error: "Create error: " + error.message }, 400);
    }
    
    return c.json({ status: "success", message: "Admin user initialized" });
  } catch (err: any) {
    console.error("Setup admin exception:", err);
    return c.json({ error: err.message }, 500);
  }
});

const BUCKET_NAME = 'make-a70c1202-assets';

// Initialize Bucket
async function initBucket() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) return;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: false });
  }
}
initBucket();

// Get site data
app.get("/make-server-a70c1202/sitedata", async (c) => {
  try {
    const data = await kv.get("portfolio_site_data");
    
    // Inject signed URLs for storage paths
    if (data) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        for (const icon of (data.dockIcons || [])) {
          if (icon.storagePath) {
            const { data: signedData } = await supabase.storage
              .from(BUCKET_NAME)
              .createSignedUrl(icon.storagePath, 60 * 60 * 24 * 7);
            
            if (signedData?.signedUrl) {
              icon.customIconData = signedData.signedUrl;
            }
          }
        }

        // Inject signed URL for hero image
        if (data.hero && data.hero.imageStoragePath) {
          const { data: signedData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(data.hero.imageStoragePath, 60 * 60 * 24 * 7);
          
          if (signedData?.signedUrl) {
            data.hero.imageUrl = signedData.signedUrl;
          }
        }

        // Also inject signed URLs for project images
        if (Array.isArray(data.projects)) {
          for (const project of data.projects) {
            if (project.imageStoragePath) {
              const { data: signedData } = await supabase.storage
                .from(BUCKET_NAME)
                .createSignedUrl(project.imageStoragePath, 60 * 60 * 24 * 7);
              
              if (signedData?.signedUrl) {
                project.imageUrl = signedData.signedUrl;
              }
            }
          }
        }
      }
    }
    
    return c.json({ data: data || null });
  } catch (err: any) {
    console.error("Get site data error:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Upload route for large files
app.post("/make-server-a70c1202/upload", async (c) => {
  try {
    const { fileData, fileName, contentType } = await c.req.json();
    
    if (!fileData) {
      return c.json({ error: "No file data provided" }, 400);
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return c.json({ error: "Missing Supabase env vars" }, 500);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Ensure bucket exists dynamically before upload
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
      if (!bucketExists) {
        await supabase.storage.createBucket(BUCKET_NAME, { public: false });
      }
    } catch (e) {
      console.warn("Bucket creation check warning:", e);
      // We continue since the bucket might already exist or the key lacks admin privileges to list buckets but has insert privileges
    }
    
    // Convert base64 to array buffer
    const base64Str = fileData.replace(/^data:.*?;base64,/, "");
    const binaryStr = atob(base64Str);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    
    const path = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, bytes, {
        contentType,
        upsert: true
      });
      
    if (error) {
      console.error("Storage upload error:", error);
      return c.json({ error: error.message }, 500);
    }
    
    return c.json({ path: data.path });
  } catch (err: any) {
    console.error("Upload exception:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Save site data (protected route)
app.post("/make-server-a70c1202/sitedata", async (c) => {
  try {
    const body = await c.req.json();
    
    // Optional auth validation (non-blocking for prototype)
    const accessToken = c.req.header('X-Access-Token');
    if (accessToken && accessToken !== 'anon') {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data, error } = await supabase.auth.getUser(accessToken);
          if (error || !data?.user) {
            console.log("Auth validation note (non-blocking):", error?.message || "No user found");
          } else {
            console.log("Authenticated save by user:", data.user.id);
          }
        }
      } catch (authErr: any) {
        console.log("Auth validation skipped (token issue):", authErr?.message);
        // Continue with save - this is a prototype
      }
    }
    
    // Safety check: ensure payload isn't too large for KV
    const payloadString = JSON.stringify(body);
    if (payloadString.length > 60000) {
      return c.json({ error: "Data is too large to save. Please make sure all images are properly uploaded to storage rather than saved as text." }, 413);
    }
    
    await kv.set("portfolio_site_data", body);
    
    return c.json({ status: "success" });
  } catch (err: any) {
    console.error("Save site data error:", err);
    const errMsg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
    return c.json({ error: errMsg || "Unknown server error" }, 500);
  }
});

Deno.serve(app.fetch);