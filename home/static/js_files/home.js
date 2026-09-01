const glowing_cursor=document.querySelector('.cursor_shadow');
const heroName=document.querySelector('#hero_name');
const heroImg=document.querySelector('#hero_img');
const philosophySection=document.querySelector('#philosophy');
const philosophyVideo=document.querySelector('#philosophy_video');
const hero_video_section=document.querySelector('.hero_video_section')
const heroVideo=document.querySelector('#hero_video')
const playButton=document.querySelector('#hero_video_play_button')
const senderEmail=document.querySelector('#sender_email');
const emailSubject=document.querySelector('#email_subject');
const message=document.querySelector('#message');
const sendBtn=document.querySelector('#send_btn');
const mailStatus=document.querySelector('#mail_status');

document.addEventListener('mousemove',(e)=>{
    glowing_cursor.style.left=`${e.clientX}px`;
    glowing_cursor.style.top=`${e.clientY}px`;
});

heroName.addEventListener('mouseenter',()=>{
    heroImg.style.opacity='0.2';
    hero_video_section.style.opacity='0';
})

heroName.addEventListener('mouseleave',()=>{
    heroImg.style.opacity='0';
    hero_video_section.style.opacity='1';
})

// philosophySection.addEventListener('mouseenter',()=>{
//     philosophyVideo.playbackRate=0.5;
//     philosophyVideo.play();
// })
// philosophySection.addEventListener('mouseleave',()=>{
//     philosophyVideo.pause();
// })


// Desktop behavior (hover to play/pause)
if (window.matchMedia("(min-width: 769px)").matches) {
  philosophySection.addEventListener('mouseenter', () => {
    philosophyVideo.playbackRate = 0.5;
    philosophyVideo.play();
  });

  philosophySection.addEventListener('mouseleave', () => {
    philosophyVideo.pause();
  });
}

// Mobile behavior (always play)
if (window.matchMedia("(max-width: 768px)").matches) {
  philosophyVideo.playbackRate = 0.5;
  philosophyVideo.play();
}

playButton.addEventListener('click',()=>{
    if(heroVideo.paused){
        heroVideo.play()
    }else{
        heroVideo.pause()
    }
})

sendBtn.addEventListener('click',(e)=>{
    e.preventDefault()
    const email=senderEmail.value 
    const subject=emailSubject.value 
    const body=message.value 
    const csrftoken=document.querySelector('[name=csrfmiddlewaretoken]').value

    fetch('/send-message/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'X-CSRFToken':csrftoken
        },
        body:JSON.stringify({
            senderEmail:email,
            emailSubject:subject,
            emailBody:body
        })
    })
    .then((response)=>{
        return response.json()
    })
    .then((data)=>{
        console.log(data)

        senderEmail.value=''
        emailSubject.value=''
        message.value=''

        mailStatus.innerHTML=`<h3>status: ${data.status}</h3>`
        mailStatus.style.right='10px';

        setTimeout(()=>{
            mailStatus.style.right='-500px';
        },3000)

         setTimeout(()=>{
            mailStatus.innerHTML='';
        },4000)
    })
    .catch((error)=>{
        console.error("[MY APP] Fetch error:", error);

        mailStatus.innerHTML = '<h3>Unable to send message. Please try again.</h3>'; 
        mailStatus.style.right = '10px'; 
        setTimeout(() => {
            mailStatus.style.right = '-500px'; 
        }, 3000);
    })
})