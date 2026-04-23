'use server'

import { revalidatePath } from 'next/cache'

interface WaitlistEntry {
  name: string
  email: string
  timestamp: string
  id: string
}

// Simple in-memory storage (in production, use a database)
let waitlist: WaitlistEntry[] = []

export async function joinWaitlist(name: string, email: string) {
  try {
    // Validate input
    if (!name || !email) {
      return {
        success: false,
        error: 'Name and email are required'
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Invalid email format'
      }
    }

    // Check if email already exists
    if (waitlist.find(entry => entry.email === email.toLowerCase())) {
      return {
        success: false,
        error: 'Email already registered'
      }
    }

    // Create new entry
    const newEntry: WaitlistEntry = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      timestamp: new Date().toISOString()
    }

    // Add to waitlist
    waitlist.push(newEntry)

    // Log the entry (in production, save to database)
    console.log('New waitlist entry:', newEntry)

    // Revalidate the page to show updated count
    revalidatePath('/')

    return {
      success: true,
      message: 'Successfully joined waitlist',
      entry: {
        name: newEntry.name,
        email: newEntry.email,
        timestamp: newEntry.timestamp
      }
    }

  } catch (error) {
    console.error('Waitlist action error:', error)
    return {
      success: false,
      error: 'Internal server error'
    }
  }
}

// Helper function to get waitlist entries (for admin use)
export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  return waitlist
}

// Helper function to get waitlist count
export async function getWaitlistCount(): Promise<number> {
  return waitlist.length
}
