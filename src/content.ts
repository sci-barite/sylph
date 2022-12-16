// This is to check for existing entries of the job. The work is done by the service worker, not slow down the page itself.
window.onload = () => {
    if (document.URL.includes("in.com/jobs/view")) chrome.runtime.sendMessage({'🧜‍♂️': LancerWebApp, '🌍': document.URL});
}

// All the work is done by this listener, and the functions it calls (from scripts that are injected selectively depending on the website.)
chrome.runtime.onMessage.addListener(Msg => {
    if (Msg['🧚‍♀️'] != 'SiftSpell') return;  // Not very useful, since it's the only message that can arrive...
    console.log('🧚‍♀️ Sylph Sifts!', Msg);
    let Sift = {Failed: true, String: "❌ She can't use her magic in here!"};
    switch (Msg['🌍'].substring(12,18)) {
        case "linked": Sift = SiftLinked(Msg['📁'], Msg['🌍']); break;  // The function checks if it's a profile or job.
        case "upwork": Sift = SiftUpwork(Msg['📁'], Msg['🌍']); break;  // The function checks if it's a profile or proposal.
        case "ni.co/": Sift = SiftDjinni(Msg['📁']); break;             // This one uses the folder only on one condition.
        case "apollo": Sift = SiftApollo(Msg['🌍']); break;             // This needs the URL just to build a better link.
    }
    // This way we catch two types of errors: return values from the functions, or unrecognized websites (seems impossible, but still.)
    if (Sift.String.startsWith('❌')) chrome.runtime.sendMessage({'🧚‍♀️': 'SpellFailed', '❌': Sift.String, '🗃️': Msg['🗃️']}); 
    if (Sift.Failed) return; 
    const LancerURI = LancerWebApp + Sift.String + '&ex='+ (Msg['💌'] || '');  // We receive a 0 if unknown, so we convert to '' if falsey.
    console.log('🧚‍♀️ -> 🧜‍♂️\n'+LancerURI);
    const Lancer = new XMLHttpRequest();
    Lancer.onreadystatechange = () => {
        if (Lancer.readyState !== XMLHttpRequest.DONE) return;  // Negative check to save on indentation.
        console.log(Lancer.status, Lancer.response);
        if (Lancer.status == 200) chrome.runtime.sendMessage({'🧚‍♀️': 'SpellSuccessful', '✔️': Lancer.response, '🗃️': Msg['🗃️']});
        else chrome.runtime.sendMessage({'🧚‍♀️': 'LancerLost', '❓': Lancer.response, '🗃️': Msg['🗃️']});
    }
    Lancer.open('GET', LancerURI, true);
    Lancer.send();
});
