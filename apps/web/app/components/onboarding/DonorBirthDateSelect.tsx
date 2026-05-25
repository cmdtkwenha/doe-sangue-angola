"use client";

import { useState } from "react";
import styles from "./onboarding.module.css";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const minBirthDate = "1900-01-01";
const oldestYear = 1900;

export const maxBirthDate = eligibleBirthDate();

export function DonorBirthDateSelect({ onChange }: { onChange: (value: string) => void }) {
  const [parts, setParts] = useState({ day: "", month: "", year: "" });
  const dayCount = daysInMonth(Number(parts.year), Number(parts.month));

  function update(next: typeof parts) {
    const day = Number(next.day);
    const maxDay = daysInMonth(Number(next.year), Number(next.month));
    const normalized = { ...next, day: day > maxDay ? "" : next.day };
    setParts(normalized);
    onChange(toBirthDate(normalized));
  }

  return (
    <>
      <div className={styles.dateGrid}>
        <select className={styles.input} value={parts.day} onChange={(event) =>
          update({ ...parts, day: event.target.value })}>
          <option value="">Dia</option>
          {Array.from({ length: dayCount }, (_, index) => index + 1).map((day) =>
            <option key={day} value={day}>{day}</option>
          )}
        </select>
        <select className={styles.input} value={parts.month} onChange={(event) =>
          update({ ...parts, month: event.target.value })}>
          <option value="">Mês</option>
          {months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
        </select>
        <select className={styles.input} value={parts.year} onChange={(event) =>
          update({ ...parts, year: event.target.value })}>
          <option value="">Ano</option>
          {yearOptions().map((year) => <option key={year}>{year}</option>)}
        </select>
      </div>
      <small className="muted">Escolha uma data. Dadores devem ter pelo menos 18 anos.</small>
    </>
  );
}

export function isEligibleBirthDate(value: string) {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && value <= maxBirthDate && value >= minBirthDate;
}

function eligibleBirthDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().slice(0, 10);
}

function daysInMonth(year: number, month: number) {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

function toBirthDate(parts: { day: string; month: string; year: string }) {
  const day = Number(parts.day);
  const month = Number(parts.month);
  const year = Number(parts.year);
  if (!day || !month || !year) return "";
  if (day > daysInMonth(year, month)) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function yearOptions() {
  const youngestYear = Number(maxBirthDate.slice(0, 4));
  return Array.from(
    { length: youngestYear - oldestYear + 1 },
    (_, index) => oldestYear + index
  );
}
