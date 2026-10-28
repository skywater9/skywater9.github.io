import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const projectsDirectory = path.join(process.cwd(), 'public', 'images', 'engineering-projects');
const coverImagePattern = /^cover-image\.(png|jpe?g|webp|avif|gif|svg)$/i;

export interface EngineeringProject {
  slug: string;
  name: string;
  coverImage: string;
  bannerImage?: string;
}

export function getEngineeringProjectsBanner(): string | undefined {
  const bannerPath = path.join(projectsDirectory, 'banner-image.png');
  return existsSync(bannerPath) ? '/images/engineering-projects/banner-image.png' : undefined;
}

export function getEngineeringProjects(): EngineeringProject[] {
  return readdirSync(projectsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const coverImage = readdirSync(path.join(projectsDirectory, entry.name))
        .find((fileName) => coverImagePattern.test(fileName));
      const bannerPath = path.join(projectsDirectory, entry.name, 'banner-image.png');

      if (!coverImage) {
        return [];
      }

      return [{
        slug: entry.name,
        name: entry.name
          .split('-')
          .map((word) => word.toLowerCase() === 'frc'
            ? 'FRC'
            : word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        coverImage: `/images/engineering-projects/${entry.name}/${coverImage}`,
        ...(existsSync(bannerPath) && {
          bannerImage: `/images/engineering-projects/${entry.name}/banner-image.png`,
        }),
      }];
    })
    .sort((first, second) => first.name.localeCompare(second.name));
}
