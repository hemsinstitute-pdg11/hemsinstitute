import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap {const base=process.env.NEXT_PUBLIC_SITE_URL||"https://example.com";return ["","/about","/programs","/instructors","/news","/gallery","/contact","/registration"].map(path=>({url:`${base}${path}`,lastModified:new Date(),changeFrequency:"monthly",priority:path===""?1:0.7}));}
