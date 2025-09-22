// Background service worker for the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Phishing Detector installed');
  // Initialize default settings
  chrome.storage.local.set({
    sensitivity: 'medium',
    enabled: true,
    whitelist: [],
    blacklist: [],
    stats: { checked: 0, blocked: 0, warned: 0 }
  });
});

// Listen for tab updates to check URLs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkURL(tab.url, tabId);
  }
});

// Check URL using AI detection
async function checkURL(url, tabId) {
  const settings = await chrome.storage.local.get(['enabled', 'sensitivity', 'whitelist', 'blacklist']);
  
  if (!settings.enabled) return;
  
  // Check against whitelist/blacklist first
  if (settings.whitelist.some(pattern => url.includes(pattern))) return;
  if (settings.blacklist.some(pattern => url.includes(pattern))) {
    blockPage(tabId, url, 'blacklisted');
    return;
  }
  
  // AI-based phishing detection
  const result = await analyzeURLWithAI(url);
  
  if (result.isPhishing) {
    const confidence = result.confidence;
    const sensitivityThreshold = {
      'low': 0.8,
      'medium': 0.6,
      'high': 0.4
    }[settings.sensitivity];
    
    if (confidence >= sensitivityThreshold) {
      blockPage(tabId, url, 'phishing');
    } else if (confidence >= sensitivityThreshold * 0.7) {
      warnPage(tabId, url, 'suspicious');
    }
  }
  
  // Update statistics
  updateStats('checked');
}

// Simulate AI URL analysis (in a real implementation, this would call an API)
async function analyzeURLWithAI(url) {
  // This is a mock implementation - replace with actual AI service
  const phishingIndicators = [
    'login', 'verify', 'account', 'bank', 'paypal', 'amazon',
    'urgent', 'security', 'update', 'confirm', 'password'
  ];
  
  const domainAnalysis = analyzeDomain(url);
  const contentAnalysis = await analyzePageContent(url);
  const heuristicScore = calculateHeuristicScore(url, domainAnalysis, contentAnalysis);
  
  return {
    isPhishing: heuristicScore > 0.5,
    confidence: heuristicScore,
    reasons: domainAnalysis.warnings.concat(contentAnalysis.warnings)
  };
}

function analyzeDomain(url) {
  const domain = new URL(url).hostname;
  const warnings = [];
  
  // Check for suspicious domain characteristics
  if (domain.includes('-')) warnings.push('Hyphens in domain');
  if (domain.split('.').length > 3) warnings.push('Long domain name');
  if (domain.length > 30) warnings.push('Suspiciously long domain');
  
  return { warnings, domainAge: 'unknown' }; // In real implementation, check domain age
}

async function analyzePageContent(url) {
  // This would require content script communication
  // For now, return mock data
  return {
    warnings: ['Suspicious login form detected'],
    hasSuspiciousForms: true
  };
}

function calculateHeuristicScore(url, domainAnalysis, contentAnalysis) {
  let score = 0;
  
  // Domain-based scoring
  if (domainAnalysis.warnings.length > 0) score += 0.3;
  if (url.includes('@')) score += 0.4; // URL obfuscation
  
  // Content-based scoring
  if (contentAnalysis.hasSuspiciousForms) score += 0.3;
  
  return Math.min(score, 1.0);
}

function blockPage(tabId, url, reason) {
  chrome.tabs.sendMessage(tabId, {
    action: 'block',
    url: url,
    reason: reason
  });
  updateStats('blocked');
}

function warnPage(tabId, url, reason) {
  chrome.tabs.sendMessage(tabId, {
    action: 'warn',
    url: url,
    reason: reason
  });
  updateStats('warned');
}

function updateStats(type) {
  chrome.storage.local.get(['stats'], (result) => {
    const stats = result.stats || { checked: 0, blocked: 0, warned: 0 };
    stats[type] = (stats[type] || 0) + 1;
    stats.checked = Math.max(stats.checked, stats.blocked + stats.warned);
    chrome.storage.local.set({ stats });
  });
}