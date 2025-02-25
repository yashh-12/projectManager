const seconds = document.getElementById("timer");
const timer = document.getElementById("resendBtn");
const error = document.getElementById("error");

console.log(seconds.innerHTML);

let second = seconds.innerHTML;
if (seconds) {
  setInterval(() => {
    if (second > 0) {
      second--;
      seconds.innerHTML = second;
    }
    else{
      timer.innerHTML = "Resend"
      timer.setAttribute("href", "/api/auth/verify");
    }
  }, 1000);
}

setTimeout(() => {
  timer.setAttribute("href", "/api/auth/verify");
}, 60000);
