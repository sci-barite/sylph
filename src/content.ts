interface Window {[key:string]: any}    // Needed to find functions by name on the window object.
// This is to check for existing entries. The work is done by the service worker, not to slow down the page.
window.onload = () => { chrome.runtime.sendMessage({'🧜‍♂️': LancerWebApp, '🌍': document.URL, '🔤': document.title}); }

// All the work is done by this listener, and the functions it calls (from scripts that are injected selectively depending on the website.)
chrome.runtime.onMessage.addListener(Msg => {
    if (Msg['✨']) chrome.runtime.sendMessage({'🧜‍♂️': LancerWebApp, '🌍': document.URL, '🔤': document.title}); // When onload is not triggered.
    if (!Msg['🧚‍♀️']) return;     // Could be put together with the above, since all other messages will have the "fairy" property.
    console.log('🧚‍♀️ Sylph Sifts!', Msg);
    const Sift = (Msg['🗺️']) ? window[`${Msg['🗺️']}Sift`](Msg) : {Failed: true, String: "❌ Sylph got lost!"}; // Bye bye switch and let!
    // This way we catch two types of errors: return values from the functions, or unrecognized websites (seems impossible, but still.)
    if (Sift.String.startsWith('❌')) chrome.runtime.sendMessage({'🧚‍♀️': true, '❌': Sift.String, '🗃️': Msg['🗃️']}); 
    if (Sift.Failed) return;    // This allows us to give the error message but continue, in a hypthetical case that we still don't have.
    const LancerURI = `${LancerWebApp}${Sift.String}&ex=${(Msg['💌'] || '')}`;  // It's sent in every case, so we must convert undefined.
    console.log('🧚‍♀️ -> 🧜‍♂️\n'+LancerURI);
    const Lancer = new XMLHttpRequest();    // All this could in theory be delegated to the service worker, and done with fetch.
    Lancer.onreadystatechange = () => {
        if (Lancer.readyState !== XMLHttpRequest.DONE) return;  // Negative check to save on indentation.
        console.log(Lancer.status, Lancer.response);
        const Row = Lancer.response.split(':')[0].slice(-4);
        if (Lancer.status == 200) chrome.runtime.sendMessage({'🧚‍♀️': true, '✔️': Lancer.response, '📝': Row, '🗃️': Msg['🗃️']});
        else chrome.runtime.sendMessage({'🧚‍♀️': true, '❓': Lancer.response, '🗃️': Msg['🗃️']});
    }
    Lancer.open('GET', LancerURI, true);
    Lancer.send();
});
