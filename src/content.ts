// This is to check for existing entries of the job. The work is done by the service worker, not slow down the page itself.
window.onload = () => {
    if (document.URL.includes("in.com/jobs/view")) chrome.runtime.sendMessage({'🧚‍♀️': 'LancerSummon', '🧜‍♂️': LancerWebApp, '🌍': document.URL});
}

// All the work is done by this listener, and the functions it calls (from scripts that are injected selectively depending on the website.)
chrome.runtime.onMessage.addListener(Msg => {
    if (Msg['🧚‍♀️'] == 'SiftSpell') {
        console.log('🧚‍♀️ Sylph Sifts!', Msg);
        let SiftedParams : string;
        switch (Msg['🌍'].substring(12,18)) {
            case "linked": SiftedParams = SiftLinked(Msg['📁'], Msg['🌍']); break;  // The function checks if it's a profile or job.
            case "upwork": SiftedParams = SiftUpwork(Msg['📁'], Msg['🌍']); break;  // The function checks if it's a profile or proposal.
            case "ni.co/": SiftedParams = SiftDjinni(Msg['📁']); break;             // This one uses the folder only on one condition.
            case "apollo": SiftedParams = SiftApollo(Msg['🌍']); break;             // This needs the URL just to build a better link.
            default: alert(Msg['🌍'].substring(12,18)+": This portion of the URL is not recognized!"); return;
        }
        if (SiftedParams.startsWith('⛔')) 
            { console.log('🧚‍♀️ Sylph shouts: "'+SiftedParams+'"'); return; }
        // This might be unnecessary: both tooltip and service worker log this.
        if (Msg['💌']) console.log('🧜‍♂️ Lancer has a record of this at '+(parseInt(Msg['💌']) + 2)+'!');
        const LancerURI = LancerWebApp + SiftedParams + '&ex='+ Msg['💌'];
        console.log('🧚‍♀️ -> 🧜‍♂️\n'+LancerURI);
        const Lancer = new XMLHttpRequest();
        Lancer.onreadystatechange = () => {
            if (Lancer.readyState === XMLHttpRequest.DONE) {
                console.log(Lancer.status, Lancer.response);
                if (Lancer.status === 200) chrome.runtime.sendMessage({'🧚‍♀️': 'SpellSuccessful', '🧜‍♂️': Lancer.response, '🗃️': Msg['🗃️']});
                else chrome.runtime.sendMessage({'🧚‍♀️': 'SpellFailed', '🧜‍♂️': Lancer.response, '🗃️': Msg['🗃️']});
            }
        }
        Lancer.open('GET', LancerURI, true);
        Lancer.send();
    }
});
