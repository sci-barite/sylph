// This is to check for existing entries. The work is done by the service worker, not to slow down the page.
window.onload = () => { chrome.runtime.sendMessage({'🧜‍♂️': LancerWebApp, '🌍': document.URL}); }

// All the work is done by this listener, and the functions it calls (from scripts that are injected selectively depending on the website.)
chrome.runtime.onMessage.addListener(Msg => {
    if (Msg['✨']) chrome.runtime.sendMessage({'🧜‍♂️': LancerWebApp, '🌍': document.URL, '🗃️': Msg['🗃️']});   // A bit redundant...
    if (!Msg['🧚‍♀️']) return;
    console.log('🧚‍♀️ Sylph Sifts!', Msg);
    let Sift = {Failed: true, String: "❌ She can't use her magic in here!"};
    switch (Msg['🌍'].substring(12,18)) {
        case "linked": Sift = SiftLinked(Msg['📁'], Msg['🌍']); break;  // The function checks if it's a profile or job.
        case "upwork": Sift = SiftUpwork(Msg['📁'], Msg['🌍']); break;  // The function checks if it's a profile or proposal.
        case "ni.co/": Sift = SiftDjinni(Msg['📁']); break;             // This one uses the folder only on one condition.
        case "apollo": Sift = SiftApollo(Msg['🌍']); break;             // This needs the URL just to build a better link.
    }
    // This way we catch two types of errors: return values from the functions, or unrecognized websites (seems impossible, but still.)
    if (Sift.String.startsWith('❌')) chrome.runtime.sendMessage({'🧚‍♀️': true, '❌': Sift.String, '🗃️': Msg['🗃️']}); 
    if (Sift.Failed) return;    // This allows us to give the error message but continue, in a hypthetical case that we still don't have.
    const LancerURI = LancerWebApp + Sift.String + '&ex='+ (Msg['💌'] || '');  // It's sent in every case, so we must convert undefined.
    console.log('🧚‍♀️ -> 🧜‍♂️\n'+LancerURI);
    const Lancer = new XMLHttpRequest();
    Lancer.onreadystatechange = () => {
        if (Lancer.readyState !== XMLHttpRequest.DONE) return;  // Negative check to save on indentation.
        console.log(Lancer.status, Lancer.response);
        const Row = Lancer.response.split(':')[0].slice(-4);
        if (Lancer.status == 200) chrome.runtime.sendMessage({'🧚‍♀️': true, '✔️': Lancer.response, '🔢': Row, '🗃️': Msg['🗃️']});
        else chrome.runtime.sendMessage({'🧚‍♀️': true, '❓': Lancer.response, '🗃️': Msg['🗃️']});
    }
    Lancer.open('GET', LancerURI, true);
    Lancer.send();
});
