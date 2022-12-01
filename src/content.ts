const Lancer = 'https://script.google.com/macros/s/AKfycbxMDCxoSFoZREabwctL86r1q8Hf5_iylcUxlZtL_4Y_dQrjwL9onaJ6G1SshfgCHqLq/exec?';

function SylphBack(Response: string, Status: number, Tab: number) {
    console.log(Response);
    if (Status == 200) chrome.runtime.sendMessage({Says: 'SpellSuccessful', LancerResponse: Response, Tab: Tab}); // Service Worker will handle success.
    else chrome.runtime.sendMessage({Says: 'SpellFailed', LancerResponse: Response, Tab: Tab});                   // Service Worker will handle failure.
}

// This is to check for existing entries of the job. The 'Go' assigned to Lancer doesn't matter, we check for presence of the key.
window.onload = () => { if (document.URL.includes("linkedin.com/jobs/view")) chrome.runtime.sendMessage({Says: 'LancerSummon', Place: document.URL}); }

chrome.runtime.onMessage.addListener(Sylph => {
    if (Sylph.Says == 'SiftSpell') {
        console.log('🧚‍♀️ Sylph!', Sylph);
        let PARAM_STRING : string;
        switch (Sylph.site.substring(12,18)) {
            case "linked": PARAM_STRING = SiftLinked(Sylph.Folder, Sylph.Place); break; // The function checks if it's a profile or job.
            case "ni.co/": PARAM_STRING = SiftDjinni(Sylph.Folder); break;
            case "apollo": PARAM_STRING = SiftApollo(Sylph.Place); break;
            case "upwork": PARAM_STRING = SiftUpwork(Sylph.Folder, Sylph.Place); break; // The function checks if it's a profile or proposal.
            default: alert(Sylph.Place.substring(12,18)+": Can't read website name!"); return;
        }
        const URI_STRING = Lancer + PARAM_STRING + '&ex='+Sylph.Ex;
        if (Sylph.Ex) console.log('🧜‍♂️ Lancer has a record of this at '+(parseInt(Sylph.Ex)+2)+'!\nPartially encoded URI string:\n'+URI_STRING);
        else console.log('🧚‍♀️ Partially encoded URI string:\n'+URI_STRING);
        const XSnd = new XMLHttpRequest();
        XSnd.onreadystatechange = () => {
            if (XSnd.readyState === XMLHttpRequest.DONE) {
                if (XSnd.status === 0 || (XSnd.status >= 200 && XSnd.status < 400)) SylphBack(XSnd.response, XSnd.status, Sylph.Tab);
                else chrome.runtime.sendMessage({Says: 'SpellFailed'}); // Service Worker will handle failure.
            }
        }
        XSnd.open('GET', URI_STRING, true);
        XSnd.send();
    }
});

