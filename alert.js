const urlParams = new URLSearchParams(window.location.search);
document.getElementById('url').textContent = decodeURIComponent(urlParams.get('url'));

document.getElementById('back').addEventListener('click', () => {
  window.history.back();
});

document.getElementById('proceed').addEventListener('click', () => {
  window.location.href = urlParams.get('url');
});