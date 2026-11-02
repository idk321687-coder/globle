import type { NextConfig } from "next";

const isGithubActions = !!process.env.GITHUB_ACTIONS;
let basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

if (isGithubActions && !basePath) {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
  if (repo && !repo.endsWith(".github.io")) {
    basePath = `/${repo}`;
  }
}

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
