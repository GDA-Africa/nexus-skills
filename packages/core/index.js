/**
 * @nexus-framework/skills
 *
 * Programmatic access to skill file paths.
 * Skill files are plain Markdown — this module just resolves their paths
 * so nexus-cli can read and copy them during `nexus init` / `nexus upgrade`.
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get the absolute path to a skill file.
 *
 * @param {string} framework - e.g. 'next.js', 'react-vite', 'shared'
 * @param {string} slug      - e.g. 'component-creation', 'git-workflow'
 * @returns {string|null}    Absolute path to the .md file, or null if not found
 */
export function getSkillPath(framework, slug) {
  const p = path.join(__dirname, framework, `${slug}.md`);
  return fs.existsSync(p) ? p : null;
}

/**
 * Read a skill file's content.
 *
 * @param {string} framework
 * @param {string} slug
 * @returns {string|null}
 */
export function getSkillContent(framework, slug) {
  const p = getSkillPath(framework, slug);
  return p ? fs.readFileSync(p, 'utf-8') : null;
}

/**
 * List all available skill slugs for a framework.
 *
 * @param {string} framework
 * @returns {string[]}
 */
export function listSkills(framework) {
  const dir = path.join(__dirname, framework);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace('.md', ''));
}

/**
 * List all frameworks that have skills available.
 *
 * @returns {string[]}
 */
export function listFrameworks() {
  return fs
    .readdirSync(__dirname)
    .filter((f) => fs.statSync(path.join(__dirname, f)).isDirectory());
}

export default { getSkillPath, getSkillContent, listSkills, listFrameworks };
