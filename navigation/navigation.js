document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.querySelector('.back-btn');
  const forwardBtn = document.querySelector('.forward-btn');

  backBtn.addEventListener('click', () => {
    window.history.back();
  });

  forwardBtn.addEventListener('click', () => {
    window.history.forward();
  });
});