var [POSITION, LINK, NAME, RATE, SKILLS, ENGLISH, LOCATION, MORE] = ['Angular', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA'];
var [APPLICANTS, PERSON, PERSON_LINK, COMPANY, COMPANY_LINK, COMPANY_SIZE, DATE] = ['NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA'];

const Lancer = 'https://script.google.com/macros/s/AKfycbxMDCxoSFoZREabwctL86r1q8Hf5_iylcUxlZtL_4Y_dQrjwL9onaJ6G1SshfgCHqLq/exec?';

function SylphBack(response : string, status : number) {
    if (status == 200) {
        //var STATUS = "✅ ";   Commenting out the alert code, now that output seems to be stable.
        console.log(response);
        //if (response.includes("DUPLICATE")) STATUS = "⚠️ DUPLICATE! "
        //if (COMPANY == 'NA') alert(STATUS+NAME+"\nPosition: "+POSITION+"\nSkills: "+SKILLS+"\nEnglish: "+ENGLISH)
        //else alert(STATUS+NAME+"\nCompany: "+COMPANY+"\nContact: "+PERSON+"\nDate: "+DATE)
        chrome.runtime.sendMessage({SpellSuccessful: true}); // Resets the extension icon to show the job is completed!
    }
    else {
        alert("⛔ ERROR!\nStatus: "+status+"\nSylph didn't find her way home!");
        chrome.runtime.sendMessage({SpellSuccessful: false}); // Update icon to show something's wrong...
    }
}

window.onload = (e) => {
    const XSnd = new XMLHttpRequest();
    XSnd.onreadystatechange = () => {
        if (XSnd.readyState === XMLHttpRequest.DONE) {
            if (XSnd.status === 200) chrome.runtime.sendMessage({LancerAnswer: XSnd.responseText});
            else chrome.runtime.sendMessage({LancerAnswer: "Oh, no! "+XSnd.status});
        }
    }
    XSnd.open('GET', Lancer+"url=GetUniqueJobs", true);
    XSnd.send();
}

chrome.runtime.onMessage.addListener((request, sender) => {
    console.log('🧚‍♀️ Sylph!', request, sender);
    if (request.name == 'Sylph') {
        switch (request.site.substring(12,18)) {
            case "linked": SiftLinked(request.position, request.site); break; // Will add job catching as well.
            case "ni.co/": SiftDjinni(request.position); break;
            case "upwork": SiftUpwork(request.position, request.site); break; // The function checks if it's a profile or proposal.
            default: alert(request.site.substring(12,18)+": Can't read website name!"); return;
        }
        if (COMPANY) {  // Must identify jobs differently when wanting to export companies!
            var PARAM_STRING : string = Lancer+'name='+encodeURIComponent(NAME)+'&url='+LINK+'&loc='+LOCATION+'&date='+DATE+'&person='+PERSON+
            '&app='+APPLICANTS+'&personlink='+PERSON_LINK+'&comp='+COMPANY+'&complink='+COMPANY_LINK+'&compsize='+COMPANY_SIZE+'&ex='+request.ex;
        }
        else {
            var PARAM_STRING : string = Lancer+'name='+NAME+'&pos='+encodeURIComponent(POSITION) // Also bookmark's folder like my original idea!
            +'&skills='+encodeURIComponent(SKILLS)+'&eng='+ENGLISH+'&rate='+RATE+'&loc='+LOCATION+'&url='+LINK+'&more='+MORE;
        }
        if (request.ex) console.log('🧜‍♂️ Lancer found a double at '+(parseInt(request.ex)+2)+'!\nPartially encoded URI string:\n'+PARAM_STRING);
        else console.log('🧚‍♀️ Partially encoded URI string:\n'+PARAM_STRING);
        const XSnd = new XMLHttpRequest();
        XSnd.onreadystatechange = () => {
            if (XSnd.readyState === XMLHttpRequest.DONE) {
                if (XSnd.status === 0 || (XSnd.status >= 200 && XSnd.status < 400)) SylphBack(XSnd.response, XSnd.status);
                else {
                    alert("⛔ ERROR!\nStatus: "+XSnd.status+"\nSylph didn't find her way home!");
                    chrome.runtime.sendMessage({SpellSuccessful: false}); // Update icon to show something's wrong...
                }
            }
        }
        XSnd.open('GET', PARAM_STRING, true);
        XSnd.send();
    }
});

