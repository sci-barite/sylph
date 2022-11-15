var [POSITION, LINK, NAME, RATE, SKILLS, ENGLISH, LOCATION, STATUS, MORE] = 
    ['NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', '0.New', ''];
var [APPLICANTS, PERSON, PERSON_LINK, COMPANY, COMPANY_LINK, COMPANY_SIZE, DATE] = 
    ['NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA'];

const Lancer = 'https://script.google.com/macros/s/AKfycbxMDCxoSFoZREabwctL86r1q8Hf5_iylcUxlZtL_4Y_dQrjwL9onaJ6G1SshfgCHqLq/exec?';

function SylphBack(response : string, status : number) {
    if (status == 200) {
        //var STATUS = "✅ ";   Commenting out the alert code, now that output seems to be stable.
        console.log(response);
        //if (response.includes("DUPLICATE")) STATUS = "⚠️ DUPLICATE! "
        //if (COMPANY == 'NA') alert(STATUS+NAME+"\nPosition: "+POSITION+"\nSkills: "+SKILLS+"\nEnglish: "+ENGLISH)
        //else alert(STATUS+NAME+"\nCompany: "+COMPANY+"\nContact: "+PERSON+"\nDate: "+DATE)
        chrome.runtime.sendMessage({SpellSuccessful: true, LancerResponse: response}); // Resets the icon to show the job is completed!
    }
    else {
        alert("⛔ ERROR!\nStatus: "+status+"\nSylph didn't find her way home!");
        chrome.runtime.sendMessage({SpellSuccessful: false, LancerResponse: response}); // Update icon to show something's wrong...
    }
}

function resetVars() {
    [POSITION, LINK, NAME, RATE, SKILLS, ENGLISH, LOCATION, STATUS, MORE] = 
    ['NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', '0.New', ''];
    [APPLICANTS, PERSON, PERSON_LINK, COMPANY, COMPANY_LINK, COMPANY_SIZE, DATE] = 
    ['NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA'];
}

window.onload = () => {
    if (document.URL.includes("linkedin.com/jobs/view")) chrome.runtime.sendMessage({Lancer: "Go", Place: document.URL});
}

chrome.runtime.onMessage.addListener((request, sender) => {
    if (request.name == 'Sylph') {
        console.log('🧚‍♀️ Sylph!', request, sender);
        switch (request.site.substring(12,18)) {
            case "linked": SiftLinked(request.position, request.site); break; // Will add job catching as well.
            case "ni.co/": SiftDjinni(request.position); break;
            case "apollo": SiftApollo(request.site); break;
            case "upwork": SiftUpwork(request.position, request.site); break; // The function checks if it's a profile or proposal.
            default: alert(request.site.substring(12,18)+": Can't read website name!"); return;
        }
        if (request.site.includes("jobs") || request.site.includes("apollo")) {  // Jobs or Apollo contacts.
            var PARAM_STRING : string = 
            Lancer+'name='+encodeURIComponent(NAME)+'&url='+LINK+'&loc='+LOCATION+'&date='+DATE+'&person='+PERSON+
            '&app='+APPLICANTS+'&personlink='+PERSON_LINK+'&comp='+COMPANY+'&complink='+COMPANY_LINK+'&compsize='+COMPANY_SIZE+
            '&more='+MORE+'&ex='+request.ex;
        }
        else {                                              // Position can be the bookmark's folder name, as per original idea!
            var PARAM_STRING : string = 
            Lancer+'name='+NAME+'&pos='+encodeURIComponent(POSITION) +'&status='+STATUS+'&skills='+encodeURIComponent(SKILLS)
            +'&eng='+ENGLISH+'&rate='+RATE+'&loc='+LOCATION+'&url='+LINK+'&more='+MORE;
        }
        if (request.ex) 
            console.log('🧜‍♂️ Lancer has a record of this at '+(parseInt(request.ex)+2)+'!\nPartially encoded URI string:\n'+PARAM_STRING);
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
        resetVars();
    }
});

