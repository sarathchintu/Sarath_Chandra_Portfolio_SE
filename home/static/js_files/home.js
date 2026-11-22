const glowing_cursor=document.querySelector('.cursor_shadow');
const heroName=document.querySelector('#hero_name');
const heroImg=document.querySelector('#hero_img');
const philosophySection=document.querySelector('#philosophy');
const philosophyVideo=document.querySelector('#philosophy_video');
const hero_video_section=document.querySelector('.hero_video_section')
const heroVideo=document.querySelector('#hero_video')
const playButton=document.querySelector('#hero_video_play_button')
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

const agent_reult=document.querySelector('#agent_playground');
const sendDetailsBtn=document.querySelector('#send_btn');
console.log('JS FILE LOADED');
console.log('SEND BUTTON:', sendDetailsBtn);
const csrf = document.querySelector('[name="csrfmiddlewaretoken"]').value 

async function postJSON(url,data){
    const res=await fetch(url,{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'X-CSRFToken':csrf
        },
        body:JSON.stringify(data || {})
    })
    const json=await res.json().catch(()=>({}))
    return {ok:res.ok,json}
}

function resetArea(){
    agent_reult.innerHTML=`<h3>Agent Interaction Area</h3>`
}

function showMSG(text){
    resetArea()
    const msg_p=document.createElement('p')
    msg_p.textContent=text
    msg_p.style.fontSize='1rem'
    agent_reult.appendChild(msg_p)
}

function showDraft(subject,body){
    resetArea()

    const subject_p=document.createElement('p')
    const subject_label=document.createElement('strong')
    subject_label.textContent='Subject: '
    subject_label.style.color='rgba(248, 29, 80, 0.4)';
    subject_label.style.fontSize='1.3rem';
    subject_p.appendChild(subject_label)
    subject_p.appendChild(document.createTextNode(subject))

    const body_p=document.createElement('p')
    const body_label=document.createElement('strong')
    body_label.textContent='Body: '
    body_label.style.color='rgba(248, 29, 80, 0.4)';
    body_label.style.fontSize='1.3rem';
    body_p.style.whiteSpace='pre-wrap'
    body_p.appendChild(body_label)
    body_p.appendChild(document.createTextNode(body))

    const decision_bts=document.createElement('div')
    decision_bts.className='decision_btns'

    const approve_btn=document.createElement('button')
    approve_btn.className='btn btn-success'
    approve_btn.textContent='Approve & Send'
    decision_bts.appendChild(approve_btn)

    const reject_btn=document.createElement('button')
    reject_btn.className='btn btn-reject'
    reject_btn.textContent='Reject'
    decision_bts.appendChild(reject_btn)

    agent_reult.appendChild(subject_p)
    agent_reult.appendChild(body_p)
    agent_reult.appendChild(decision_bts)

    function setBUSY(busy){
        approve_btn.disabled=busy
        reject_btn.disabled=busy
    }

    approve_btn.addEventListener('click',async(e)=>{
        e.preventDefault()

        setBUSY(true)
        const {ok,json}=await postJSON('/approve-mail/')
        if(!ok){
            setBUSY(false)
            showMSG(json || 'something went wrong')
            return
        }
        showMSG('Mail Sent! Sarath will reply soon')
    })

    reject_btn.addEventListener('click',async(e)=>{
        e.preventDefault()

        setBUSY(true)
        await postJSON('/reject-mail/')
        showMSG('Draft rejected. Nothing was sent.')
    })
}

function showDraftError(text){
    resetArea()

    const error_p=document.createElement('p')
    error_p.textContent=text
    error_p.style.color='tomato'
    agent_reult.appendChild(error_p)
}

sendDetailsBtn.addEventListener('click',async(e)=>{

    console.log('SEND BUTTON CLICKED');
    e.preventDefault()

    showMSG('Drafting Email')

    console.log('DEFAULT SUBMISSION PREVENTED');
    const visitor_mail=document.getElementById('visitor_email').value.trim()
    const mail_context=document.getElementById('mail_context').value.trim()

    if(!visitor_mail || !mail_context){
        showDraftError('Both field should be filled before submission')
        return
    }

    sendDetailsBtn.disabled=true
    try{
        const {ok,json}=await postJSON('/send-details/',{
            visitor_email: visitor_mail,
            mail_context: mail_context
        })
        if(!ok){
            showDraftError(json.msg || 'something went wrong try again later')
        }else{
            showDraft(json.subject,json.body)
        }
    }
    catch (err){
        console.log(err)
        showDraftError('netwrok slow please try again later')
    }
    finally{
        sendDetailsBtn.disabled=false
    }
})


// sendBtn.addEventListener('click',(e)=>{
//     e.preventDefault()
//     const email=senderEmail.value 
//     const subject=emailSubject.value 
//     const body=message.value 
//     const csrftoken=document.querySelector('[name=csrfmiddlewaretoken]').value

//     fetch('/send-details/',{
//         method:'POST',
//         headers:{
//             'Content-Type':'application/json',
//             'X-CSRFToken':csrftoken
//         },
//         body:JSON.stringify({
//             senderEmail:email,
//             emailSubject:subject,
//             emailBody:body
//         })
//     })
//     .then((response)=>{
//         return response.json()
//     })
//     .then((data)=>{
//         console.log(data)

//         senderEmail.value=''
//         emailSubject.value=''
//         message.value=''

//         mailStatus.innerHTML=`<h3>status: ${data.status}</h3>`
//         mailStatus.style.right='10px';

//         setTimeout(()=>{
//             mailStatus.style.right='-500px';
//         },3000)

//          setTimeout(()=>{
//             mailStatus.innerHTML='';
//         },4000)
//     })
//     .catch((error)=>{
//         console.error("[MY APP] Fetch error:", error);

//         mailStatus.innerHTML = '<h3>Unable to send message. Please try again.</h3>'; 
//         mailStatus.style.right = '10px'; 
//         setTimeout(() => {
//             mailStatus.style.right = '-500px'; 
//         }, 3000);
//     })
// })