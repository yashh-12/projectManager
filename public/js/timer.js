
const timer = document.getElementById('resendBtn');
const error = document.getElementById('error');
console.log(timer.innerHTML);

if(timer && !error){
    let second = 60;
setInterval(()=>{
    if(second > 0){
        timer.innerHTML = `Resend in ${second - 1} seconds`;
        second--;
    }
    else{
        timer.innerHTML = "Resend";
    }
},1000)
setTimeout(()=>{
    timer.setAttribute("href", "/api/auth/verify");
},60000)
}
else{
    timer.innerHTML = "Resend";
    timer.setAttribute("href", "/api/auth/verify");
}

