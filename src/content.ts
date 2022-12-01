const Lancer = 'https://script.google.com/macros/s/AKfycbxMDCxoSFoZREabwctL86r1q8Hf5_iylcUxlZtL_4Y_dQrjwL9onaJ6G1SshfgCHqLq/exec?';

function SylphBack(response: string, status: number, tabId: number) {
    if (status == 200) {
        console.log(response);
        chrome.runtime.sendMessage({SpellSuccessful: true, LancerResponse: response, Tab: tabId}); // Resets the icon to show the job is completed!
    }
    else {
        console.log(response);
        chrome.runtime.sendMessage({SpellSuccessful: false, LancerResponse: response, Tab: tabId}); // Update icon to show something's wrong...
    }
}

// This is to check for existing entries of the job. The 'Go' assigned to Lancer doesn't matter, we check for presence of the key.
window.onload = () => { if (document.URL.includes("linkedin.com/jobs/view")) chrome.runtime.sendMessage({Lancer: "Go", Place: document.URL}); }

chrome.runtime.onMessage.addListener(request => {
    if (request.name == 'Sylph') {
        console.log('🧚‍♀️ Sylph!', request);
        let PARAM_STRING : string;
        switch (request.site.substring(12,18)) {
            case "linked": PARAM_STRING = SiftLinked(request.position, request.site); break; // The function checks if it's a profile or job.
            case "ni.co/": PARAM_STRING = SiftDjinni(request.position); break;
            case "apollo": PARAM_STRING = SiftApollo(request.site); break;
            case "upwork": PARAM_STRING = SiftUpwork(request.position, request.site); break; // The function checks if it's a profile or proposal.
            default: alert(request.site.substring(12,18)+": Can't read website name!"); return;
        }
        const URI_STRING = Lancer + PARAM_STRING + '&ex='+request.ex;
        if (request.ex) 
            console.log('🧜‍♂️ Lancer has a record of this at '+(parseInt(request.ex)+2)+'!\nPartially encoded URI string:\n'+URI_STRING);
        else console.log('🧚‍♀️ Partially encoded URI string:\n'+URI_STRING);
        const XSnd = new XMLHttpRequest();
        XSnd.onreadystatechange = () => {
            if (XSnd.readyState === XMLHttpRequest.DONE) {
                if (XSnd.status === 0 || (XSnd.status >= 200 && XSnd.status < 400)) SylphBack(XSnd.response, XSnd.status, request.tab);
                else chrome.runtime.sendMessage({SpellSuccessful: false}); // Update icon to show something's wrong...
            }
        }
        XSnd.open('GET', URI_STRING, true);
        XSnd.send();
    }
});

