// Content script to handle page warnings and blocking
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'block') {
    blockPage(request.url, request.reason);
  } else if (request.action === 'warn') {
    showWarning(request.url, request.reason);
  }
});

function blockPage(url, reason) {
  // Replace page content with warning
  document.body.innerHTML = `
    <div class="phishing-warning">
      <div class="warning-content">
        <h1>⚠️ Security Warning</h1>
        <p>This page has been blocked by AI Phishing Detector.</p>
        <p><strong>Reason:</strong> ${getReasonText(reason)}</p>
        <p><strong>URL:</strong> ${url}</p>
        <div class="actions">
          <button id="goBack" class="btn btn-secondary">Go Back</button>
          <button id="proceedAnyway" class="btn btn-danger">Proceed Anyway</button>
          <button id="reportError" class="btn btn-info">Report False Positive</button>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('goBack').addEventListener('click', () => {
    window.history.back();
  });
  
  document.getElementById('proceedAnyway').addEventListener('click', () => {
    document.body.innerHTML = '';
    window.location.reload();
  });
  
  document.getElementById('reportError').addEventListener('click', () => {
    reportFalsePositive(url, reason);
  });
}

function showWarning(url, reason) {
  // Add warning banner to the top of the page
  const warningBanner = document.createElement('div');
  warningBanner.className = 'phishing-warning-banner';
  warningBanner.innerHTML = `
    <div class="warning-banner-content">
      <span class="warning-icon">⚠️</span>
      <span class="warning-text">Warning: ${getReasonText(reason)}</span>
      <button class="close-warning">×</button>
      <button class="learn-more">Learn More</button>
    </div>
  `;
  
  document.body.prepend(warningBanner);
  
  warningBanner.querySelector('.close-warning').addEventListener('click', () => {
    warningBanner.remove();
  });
  
  warningBanner.querySelector('.learn-more').addEventListener('click', () => {
    alert(`This page (${url}) has been flagged as potentially suspicious. Proceed with caution.`);
  });
}

function getReasonText(reason) {
  const reasons = {
    'phishing': 'Potential phishing attempt detected',
    'suspicious': 'Suspicious characteristics detected',
    'blacklisted': 'URL is in your blacklist'
  };
  return reasons[reason] || 'Security concern detected';
}

function reportFalsePositive(url, reason) {
  // In a real implementation, this would send a report to your backend
  alert(`False positive reported for: ${url}\nReason: ${reason}`);
  console.log('False positive reported:', { url, reason });
}