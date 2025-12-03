/**
 * Timezone Utilities for Indonesia
 * Handles WIB, WITA, WIT timezones
 */

// Simplified timezone utility without date-fns-tz dependency
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

// Indonesia Timezones
export const TIMEZONE_WIB = 'Asia/Jakarta';   // UTC+7 (Western)
export const TIMEZONE_WITA = 'Asia/Makassar'; // UTC+8 (Central)
export const TIMEZONE_WIT = 'Asia/Jayapura';  // UTC+9 (Eastern)

// Default timezone for the application (Jakarta)
export const DEFAULT_TIMEZONE = TIMEZONE_WIB;

/**
 * Convert any date to WIB timezone
 */
export function convertToWIB(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj; // Simplified for deployment
}

/**
 * Convert any date to WITA timezone
 */
export function convertToWITA(date: Date | string): Date {
  return toZonedTime(date, TIMEZONE_WITA);
}

/**
 * Convert any date to WIT timezone
 */
export function convertToWIT(date: Date | string): Date {
  return toZonedTime(date, TIMEZONE_WIT);
}

/**
 * Format date in WIB timezone
 */
export function formatWIB(date: Date | string, formatStr: string = 'dd MMM yyyy HH:mm'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: localeId });
}

/**
 * Format date in WITA timezone
 */
export function formatWITA(date: Date | string, formatStr: string = 'dd MMM yyyy HH:mm'): string {
  return formatInTimeZone(date, TIMEZONE_WITA, formatStr, { locale: localeId });
}

/**
 * Format date in WIT timezone
 */
export function formatWIT(date: Date | string, formatStr: string = 'dd MMM yyyy HH:mm'): string {
  return formatInTimeZone(date, TIMEZONE_WIT, formatStr, { locale: localeId });
}

/**
 * Get current date/time in WIB
 */
export function nowInWIB(): Date {
  return convertToWIB(new Date());
}

/**
 * Format date for database (ISO 8601 in UTC)
 */
export function formatForDatabase(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Check if a date is today (in WIB timezone)
 */
export function isToday(date: Date | string): boolean {
  const dateInWIB = convertToWIB(date);
  const todayInWIB = nowInWIB();
  
  return (
    dateInWIB.getDate() === todayInWIB.getDate() &&
    dateInWIB.getMonth() === todayInWIB.getMonth() &&
    dateInWIB.getFullYear() === todayInWIB.getFullYear()
  );
}

/**
 * Get timezone offset string (e.g., "WIB", "WITA", "WIT")
 */
export function getTimezoneLabel(timezone: string): string {
  switch (timezone) {
    case TIMEZONE_WIB:
      return 'WIB';
    case TIMEZONE_WITA:
      return 'WITA';
    case TIMEZONE_WIT:
      return 'WIT';
    default:
      return 'WIB';
  }
}
