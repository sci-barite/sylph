var [POSITION, LINK, NAME, RATE, SKILLS, ENGLISH, LOCATION, MORE] = ['Angular', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA', 'NA'];
var [PERSON, PERSON_LINK, COMPANY, COMPANY_LINK, COMPANY_SIZE, DATE] = ['NA', 'NA', 'NA', 'NA', 'NA', 'NA'];

function SylphBack(response : string, status : number) {
    if (status == 200) {
        var STATUS = "✅ ";
        console.log(response);
        if (response.includes("DUPLICATE")) STATUS = "⚠️ DUPLICATE! "
        if (COMPANY == 'NA') alert(STATUS+NAME+"\nPosition: "+POSITION+"\nSkills: "+SKILLS+"\nEnglish: "+ENGLISH)
        else alert(STATUS+NAME+"\nCompany: "+COMPANY+"\nContact: "+PERSON+"\nDate: "+DATE)
        chrome.runtime.sendMessage({SpellSuccessful: true}); // Resets the extension icon to show the job is completed!
    }
    else {
        alert("⛔ ERROR!\nStatus: "+status+"\nSylph didn't find her way home!");
        chrome.runtime.sendMessage({SpellSuccessful: false}); // Update icon to show something's wrong...
    }
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
        if (COMPANY) {
        var PARAM_STRING : string = 
            'https://script.google.com/macros/s/AKfycbzlvodnWV4GjTP7rdyFalR2Hd4a_R2F-vlDpTY0P_NLkKtI-kER9NGbDXdVNzNNEpDj/exec?'+
            'name='+encodeURIComponent(NAME)+'&url='+LINK+'&loc='+LOCATION+'&date='+DATE // Now for lead generation!
            +'&person='+PERSON+'&personlink='+PERSON_LINK+'&comp='+COMPANY+'&complink='+COMPANY_LINK+'&compsize='+COMPANY_SIZE;
        }
        else {
        var PARAM_STRING : string = 
            'https://script.google.com/macros/s/AKfycbwnxLSGIhUkFLk61Ef7wn9g6gdIFAaeP7X9XsQzQ4UVyI-5wCR-js8WwDE-g2Gp8iqk/exec?'+
            'name='+NAME+'&pos='+encodeURIComponent(POSITION) // Now it can be the bookmark's folder, as per the original idea!
            +'&skills='+encodeURIComponent(SKILLS)+'&eng='+ENGLISH+'&rate='+RATE+'&loc='+LOCATION+'&url='+LINK+'&more='+MORE;
        }
        console.log('🧚‍♀️ Partially encoded URI string:\n'+PARAM_STRING);
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

