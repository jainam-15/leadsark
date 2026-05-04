import { LeadStatus } from '@/app/(dashboard)/leads/page';

export interface ScoringSignals {
  messageCount: number;
  lastMessageText?: string;
  inactivityDays: number;
  hasRequirements: boolean;
  hasBudget: boolean;
}

/**
 * Calculates the lead score based on engagement and content signals
 */
export function calculateLeadScore(currentScore: number, signals: ScoringSignals): number {
  let score = currentScore;

  // 1. Engagement (Messages)
  if (signals.messageCount > 6) score += 40;
  else if (signals.messageCount > 3) score += 20;

  // 2. Keyword Signals
  if (signals.lastMessageText) {
    const text = signals.lastMessageText.toLowerCase();
    
    // Hot Keywords (+30)
    const hotKeywords = ['price', 'cost', 'buy', 'book', 'urgent', 'now', 'package'];
    if (hotKeywords.some(k => text.includes(k))) score += 30;

    // Warm Keywords (+15)
    const warmKeywords = ['details', 'info', 'options', 'how', 'proposal'];
    if (warmKeywords.some(k => text.includes(k))) score += 15;

    // Cold Keywords (-20)
    const coldKeywords = ['later', 'not now', 'expensive', 'stop', 'unsubscribe'];
    if (coldKeywords.some(k => text.includes(k))) score -= 20;
  }

  // 3. Funnel Progression
  if (signals.hasRequirements) score += 25;
  if (signals.hasBudget) score += 35;

  // 4. Inactivity Penalty
  if (signals.inactivityDays > 7) score -= 40;
  else if (signals.inactivityDays > 3) score -= 20;

  // Clamp score between 0 and 100
  return Math.min(Math.max(score, 0), 100);
}

/**
 * Suggests a status based on the score
 */
export function suggestStatus(score: number): LeadStatus {
  if (score >= 70) return "Hot";
  if (score >= 30) return "Warm";
  return "Cold";
}
