const Lancer = 'https://script.google.com/macros/s/AKfycbxMDCxoSFoZREabwctL86r1q8Hf5_iylcUxlZtL_4Y_dQrjwL9onaJ6G1SshfgCHqLq/exec?';

// This is to check for existing entries of the job. The 'Go' assigned to Lancer doesn't matter, we check for presence of the key.
window.onload = () => { if (document.URL.includes("linkedin.com/jobs/view")) chrome.runtime.sendMessage({Says: 'LancerSummon', Place: document.URL}); }

// All the work is done by this listener, and the functions it calls (from scripts that are injected selectively depending on the website.)
chrome.runtime.onMessage.addListener(Sylph => {
    if (Sylph.Says == 'SiftSpell') {
        console.log('🧚‍♀️ Sylph Sifts!', Sylph);
        let PARAM_STRING : string;
        switch (Sylph.Place.substring(12,18)) {
            case "linked": PARAM_STRING = SiftLinked(Sylph.Folder, Sylph.Place); break; // The function checks if it's a profile or job.
            case "ni.co/": PARAM_STRING = SiftDjinni(Sylph.Folder); break;
            case "apollo": PARAM_STRING = SiftApollo(Sylph.Place); break;
            case "upwork": PARAM_STRING = SiftUpwork(Sylph.Folder, Sylph.Place); break; // The function checks if it's a profile or proposal.
            default: alert(Sylph.Place.substring(12,18)+": This portion of the URL is not recognized!"); return;
        }
        const URI_STRING = Lancer + PARAM_STRING + '&ex='+Sylph.Ex;
        if (Sylph.Ex) console.log('🧜‍♂️ Lancer has a record of this at '+(parseInt(Sylph.Ex)+2)+'!\nSylph sends this to Lancer:\n'+URI_STRING);
        else console.log('🧚‍♀️ Sylph sends this to Lancer:\n'+URI_STRING);
        const XSnd = new XMLHttpRequest();
        XSnd.onreadystatechange = () => {
            if (XSnd.readyState === XMLHttpRequest.DONE) {
                console.log(XSnd.response);
                if (XSnd.status === 200) chrome.runtime.sendMessage({Says: 'SpellSuccessful', LancerResponse: XSnd.response, Tab: Sylph.Tab});
                if (XSnd.status === 0 || (XSnd.status > 200 && XSnd.status < 400)) 
                    chrome.runtime.sendMessage({Says: 'SpellFailed', LancerResponse: XSnd.response, Tab: Sylph.Tab});   
                else chrome.runtime.sendMessage({Says: 'SpellFailed', Tab: Sylph.Tab}); // In this case, Lancer must not have been reached.
            }
        }
        XSnd.open('GET', URI_STRING, true);
        XSnd.send();
    }
});

