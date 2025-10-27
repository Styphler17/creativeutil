import fs from "fs";
import path from "path";

const ROOT_URL = "https://creativeutil.com";
const projectRoot = process.cwd();
const toolsConfigPath = path.resolve(projectRoot, "src/config/tools.ts");
const sitemapPath = path.resolve(projectRoot, "public/sitemap.xml");
const today = new Date().toISOString().split("T")[0];

const readToolIds = () => {
  const source = fs.readFileSync(toolsConfigPath, "utf8");
  const matches = Array.from(source.matchAll(/id:\s*"([^"]+)"/g));
  const ids = matches.map((match) => match[1]);
  return Array.from(new Set(ids));
};

const baseRoutes = [
  { loc: `${ROOT_URL}/`, changefreq: "daily", priority: "1.0" },
  { loc: `${ROOT_URL}/tools`, changefreq: "weekly", priority: "0.9" },
  { loc: `${ROOT_URL}/about`, changefreq: "monthly", priority: "0.7" },
  { loc: `${ROOT_URL}/contact`, changefreq: "monthly", priority: "0.7" },
  { loc: `${ROOT_URL}/privacy`, changefreq: "yearly", priority: "0.5" },
  { loc: `${ROOT_URL}/terms`, changefreq: "yearly", priority: "0.5" },
];

const buildXmlNode = ({ loc, changefreq, priority }) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const generateSitemap = () => {
  const toolIds = readToolIds();
  const toolRoutes = toolIds.map((id) => ({
    loc: `${ROOT_URL}/tools/${id}`,
    changefreq: "monthly",
    priority: "0.8",
  }));

  const urls = [...baseRoutes, ...toolRoutes]
    .map((route) => buildXmlNode(route))
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  fs.writeFileSync(sitemapPath, xml.trim() + "\n", "utf8");
  console.log(`Sitemap updated with ${baseRoutes.length + toolRoutes.length} URLs.`);
};

generateSitemap();
