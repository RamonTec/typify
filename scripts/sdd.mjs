#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const FEATURES_DIR = join(ROOT, 'docs/features');
const TEMPLATES_DIR = join(ROOT, 'docs/sdd/templates');
const DOCS = ['spec', 'plan', 'tasks', 'checklist'];

const usage = `Uso:
  node scripts/sdd.mjs new <slug> [--title "Título"]   Crea docs/features/NNN-slug desde las plantillas
  node scripts/sdd.mjs status [feature]                 Estado de las features (o de una)
  node scripts/sdd.mjs active                           Ruta de la feature activa`;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function listFeatures() {
  if (!existsSync(FEATURES_DIR)) return [];
  return readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{3}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function readState(dir, doc) {
  const file = join(dir, `${doc}.md`);
  if (!existsSync(file)) return null;
  const content = readFileSync(file, 'utf8');
  const estado = content.match(/^estado:\s*(\S+)/m)?.[1] ?? 'desconocido';
  return { estado, content };
}

function countTasks(content) {
  const tasks = [...content.matchAll(/^\s*- \[( |x|X)\] T\d{3}/gm)];
  const done = tasks.filter((match) => match[1] !== ' ').length;
  return { done, total: tasks.length };
}

function inspect(name) {
  const dir = join(FEATURES_DIR, name);
  const docs = Object.fromEntries(DOCS.map((doc) => [doc, readState(dir, doc)]));
  if (!docs.spec) return { name, dir, legacy: true, next: null };

  const tasks = docs.tasks ? countTasks(docs.tasks.content) : { done: 0, total: 0 };
  const state = (doc) => docs[doc]?.estado ?? 'pendiente';
  let next;
  if (state('spec') !== 'aprobado') next = '/sdd-spec (redactar o aprobar spec.md)';
  else if (state('plan') !== 'aprobado') next = '/sdd-plan';
  else if (state('tasks') === 'pendiente' || state('tasks') === 'borrador') next = '/sdd-tasks (generar o aprobar tasks.md)';
  else if (tasks.done < tasks.total) next = '/sdd-implement';
  else if (state('checklist') !== 'completado') next = '/sdd-verify';
  else next = null;

  return { name, dir, legacy: false, docs, tasks, next, state };
}

function activeFeature() {
  const features = listFeatures().map(inspect).filter((feature) => !feature.legacy && feature.next);
  return features.at(-1) ?? null;
}

function render(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

function cmdNew(args) {
  const slug = args[0];
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    fail('Indica un slug en kebab-case, p. ej.: node scripts/sdd.mjs new export-csv');
  }
  const titleIndex = args.indexOf('--title');
  const title = titleIndex >= 0 && args[titleIndex + 1] ? args[titleIndex + 1] : slug.replace(/-/g, ' ');

  const existing = listFeatures();
  if (existing.some((name) => name.slice(4) === slug)) fail(`Ya existe una feature con el slug "${slug}".`);
  const nextNumber = existing.reduce((max, name) => Math.max(max, Number(name.slice(0, 3))), 0) + 1;
  const id = String(nextNumber).padStart(3, '0');
  const name = `${id}-${slug}`;
  const dir = join(FEATURES_DIR, name);
  mkdirSync(dir, { recursive: true });

  const vars = { ID: id, SLUG: slug, TITLE: title, DATE: new Date().toISOString().slice(0, 10) };
  for (const doc of DOCS) {
    const template = readFileSync(join(TEMPLATES_DIR, `${doc}.md`), 'utf8');
    writeFileSync(join(dir, `${doc}.md`), render(template, vars));
  }
  console.log(relative(ROOT, dir));
}

function cmdStatus(args) {
  const filter = args[0];
  const features = listFeatures()
    .filter((name) => !filter || name === filter || name.startsWith(`${filter}-`) || name.slice(4) === filter)
    .map(inspect);
  if (features.length === 0) {
    console.log(filter ? `No se encontró la feature "${filter}".` : 'No hay features. Crea una con /sdd-spec.');
    return;
  }

  const active = activeFeature();
  for (const feature of features) {
    const marker = active?.name === feature.name ? ' (activa)' : '';
    console.log(`\n${feature.name}${marker}`);
    if (feature.legacy) {
      console.log('  formato legado, sin spec.md');
      continue;
    }
    for (const doc of DOCS) console.log(`  ${doc.padEnd(10)} ${feature.state(doc)}`);
    console.log(`  progreso   ${feature.tasks.done}/${feature.tasks.total} tareas`);
    console.log(`  siguiente  ${feature.next ?? 'completada'}`);
  }
}

function cmdActive() {
  const active = activeFeature();
  if (!active) fail('No hay feature activa.');
  console.log(relative(ROOT, active.dir));
}

const [command, ...args] = process.argv.slice(2);
const commands = { new: cmdNew, status: cmdStatus, active: cmdActive };
if (!commands[command]) {
  console.log(usage);
  process.exit(command ? 1 : 0);
}
commands[command](args);
