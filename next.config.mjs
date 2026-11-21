/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ["node-ical", "web-push"],
};
export default nextConfig;
