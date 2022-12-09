// This is to check for existing entries of the job. The work is done by the service worker, not slow down the page itself.
window.onload = () => {
    if (document.URL.includes("in.com/jobs/view")) chrome.runtime.sendMessage({'🧚‍♀️': 'LancerSummon', '🧜‍♂️': LancerWebApp, '🌍': document.URL});
}

// All the work is done by this listener, and the functions it calls (from scripts that are injected selectively depending on the website.)
chrome.runtime.onMessage.addListener(Msg => {
    if (Msg['🧚‍♀️'] !== 'SiftSpell') return;  // Not very useful, since it's the only message that can arrive...
    console.log('🧚‍♀️ Sylph Sifts!', Msg);
    let SiftedParams = "❌ She can't use her magic in here!";
    switch (Msg['🌍'].substring(12,18)) {
        case "linked": SiftedParams = SiftLinked(Msg['📁'], Msg['🌍']); break;  // The function checks if it's a profile or job.
        case "upwork": SiftedParams = SiftUpwork(Msg['📁'], Msg['🌍']); break;  // The function checks if it's a profile or proposal.
        case "ni.co/": SiftedParams = SiftDjinni(Msg['📁']); break;             // This one uses the folder only on one condition.
        case "apollo": SiftedParams = SiftApollo(Msg['🌍']); break;             // This needs the URL just to build a better link.
    }
    if (SiftedParams.startsWith('❌')) { 
        chrome.runtime.sendMessage({'🧚‍♀️': 'SpellFailed', '❌': SiftedParams, '🗃️': Msg['🗃️']}); 
        return; 
    }
    const LancerURI = LancerWebApp + SiftedParams + '&ex='+ (Msg['💌'] || '');  // We now send a 0 if unknown, and reconvert to '' if 0.
    console.log('🧚‍♀️ -> 🧜‍♂️\n'+LancerURI);
    const Lancer = new XMLHttpRequest();
    Lancer.onreadystatechange = () => {
        if (Lancer.readyState !== XMLHttpRequest.DONE) return;  // Negative check to save on indentation.
        console.log(Lancer.status, Lancer.response);
        if (Lancer.status === 200) chrome.runtime.sendMessage({'🧚‍♀️': 'SpellSuccessful', '🧜‍♂️': Lancer.response, '🗃️': Msg['🗃️']});
        else chrome.runtime.sendMessage({'🧚‍♀️': 'SpellFailed', '🧜‍♂️': Lancer.response, '🗃️': Msg['🗃️']});
    }
    Lancer.open('GET', LancerURI, true);
    Lancer.send();
});
