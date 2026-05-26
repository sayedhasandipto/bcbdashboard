// src/lib/db.ts
import { ref, get, set, update, remove, onValue, off } from 'firebase/database';
import { db, isFirebaseConfigured } from './firebase';
import {
  Teacher, Student, Subject, MarksMap, MarkEntry,
  DEFAULT_CLASSES, DEFAULT_SUBJECTS, DEFAULT_TEACHERS
} from '@/types';

const PREFIX = 'bcb/';

function checkConfig() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration is missing. Please create a .env.local file with Firebase credentials.');
  }
}

// ── Generic helpers ──────────────────────────────────────────
export async function dbGet<T>(path: string): Promise<T | null> {
  checkConfig();
  const snap = await get(ref(db, PREFIX + path));
  return snap.exists() ? (snap.val() as T) : null;
}

export async function dbSet<T>(path: string, value: T): Promise<void> {
  checkConfig();
  await set(ref(db, PREFIX + path), value);
}

export async function dbUpdate(path: string, updates: Record<string, unknown>): Promise<void> {
  checkConfig();
  await update(ref(db, PREFIX + path), updates);
}

export async function dbRemove(path: string): Promise<void> {
  checkConfig();
  await remove(ref(db, PREFIX + path));
}

export function dbListen<T>(path: string, cb: (val: T | null) => void) {
  checkConfig();
  const r = ref(db, PREFIX + path);
  onValue(r, snap => cb(snap.exists() ? snap.val() as T : null));
  return () => off(r);
}

// ── Initializer ──────────────────────────────────────────────
export async function initializeFirebaseData(): Promise<void> {
  const initialized = await dbGet<boolean>('initialized');
  if (initialized) return;

  const students: Student[] = [];
  const names = ['লিমন','রাহেলা','সুমন','নাফিসা','তামিম','মৌসুমী','ইমরান','সাদিয়া',
    'রিফাত','মাহমুদা','হাসান','পারভীন','সজল','রিমা','আকাশ','সুমাইয়া','শান্ত','তাসনিম','নয়ন','সাবরিনা'];
  let sid = 1;
  DEFAULT_CLASSES.forEach(cls => {
    for (let r = 1; r <= 20; r++) {
      students.push({ id: 's' + sid, name: names[(sid - 1) % names.length], class: cls, roll: r });
      sid++;
    }
  });

  await dbSet('classes', DEFAULT_CLASSES);
  await dbSet('subjects', DEFAULT_SUBJECTS);
  await dbSet('teachers', DEFAULT_TEACHERS);
  await dbSet('students', students);
  await dbSet('marks', {});
  await dbSet('initialized', true);
}

// ── Teachers ─────────────────────────────────────────────────
export async function getTeachers(): Promise<Teacher[]> {
  return (await dbGet<Teacher[]>('teachers')) ?? [];
}

export async function saveTeacher(teacher: Teacher): Promise<void> {
  const teachers = await getTeachers();
  const idx = teachers.findIndex(t => t.id === teacher.id);
  if (idx >= 0) teachers[idx] = teacher;
  else teachers.push(teacher);
  await dbSet('teachers', teachers);
}

export async function deleteTeacher(id: string): Promise<void> {
  const teachers = (await getTeachers()).filter(t => t.id !== id);
  await dbSet('teachers', teachers);
}

// ── Students ─────────────────────────────────────────────────
export async function getStudents(): Promise<Student[]> {
  return (await dbGet<Student[]>('students')) ?? [];
}

export async function saveStudent(student: Student): Promise<void> {
  const students = await getStudents();
  const idx = students.findIndex(s => s.id === student.id);
  if (idx >= 0) students[idx] = student;
  else students.push(student);
  await dbSet('students', students);
}

export async function deleteStudent(id: string): Promise<void> {
  const students = (await getStudents()).filter(s => s.id !== id);
  await dbSet('students', students);
}

// ── Subjects ─────────────────────────────────────────────────
export async function getSubjects(): Promise<Subject[]> {
  return (await dbGet<Subject[]>('subjects')) ?? [];
}

export async function saveSubject(subject: Subject): Promise<void> {
  const subjects = await getSubjects();
  const idx = subjects.findIndex(s => s.id === subject.id);
  if (idx >= 0) subjects[idx] = subject;
  else subjects.push(subject);
  await dbSet('subjects', subjects);
}

export async function deleteSubject(id: string): Promise<void> {
  const subjects = (await getSubjects()).filter(s => s.id !== id);
  await dbSet('subjects', subjects);
}

// ── Classes ──────────────────────────────────────────────────
export async function getClasses(): Promise<string[]> {
  return (await dbGet<string[]>('classes')) ?? [];
}

export async function saveClasses(classes: string[]): Promise<void> {
  await dbSet('classes', classes);
}

// ── Marks ────────────────────────────────────────────────────
export async function getMarks(): Promise<MarksMap> {
  return (await dbGet<MarksMap>('marks')) ?? {};
}

export async function saveMarksBatch(
  entries: Record<string, MarkEntry>
): Promise<void> {
  const updates: Record<string, MarkEntry> = {};
  Object.entries(entries).forEach(([key, val]) => {
    updates[key] = val;
  });
  await update(ref(db, PREFIX + 'marks'), updates);
}
