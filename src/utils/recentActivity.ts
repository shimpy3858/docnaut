export function saveRecentActivity(toolId: string, toolTitle: string, fileName: string) {
  try {
    const key = 'rajkosh_recent';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const entry = { toolId, toolTitle, fileName, timestamp: Date.now() };
    const updated = [entry, ...existing].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function getRecentActivity(): { toolId: string; toolTitle: string; fileName: string; timestamp: number }[] {
  try {
    return JSON.parse(localStorage.getItem('rajkosh_recent') || '[]');
  } catch {
    return [];
  }
}

export function clearRecentActivity() {
  localStorage.removeItem('rajkosh_recent');
}
