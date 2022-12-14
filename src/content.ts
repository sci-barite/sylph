interface Window {[key:string]: any}    // Needed to find functions by name on the window object.
// This is to check for existing entries. The work is done by the service worker, not to slow down the page.
window.onload = () => { chrome.runtime.sendMessage({'π§ββοΈ': LancerWebApp, 'π': document.URL, 'π€': document.title}); }

// All the work is done by this listener, and the functions it calls (from scripts that are injected selectively depending on the website.)
chrome.runtime.onMessage.addListener(Msg => {
    if (Msg['β¨']) chrome.runtime.sendMessage({'π§ββοΈ': LancerWebApp, 'π': document.URL, 'π€': document.title}); // When onload is not triggered.
    if (!Msg['π§ββοΈ']) return;     // Could be put together with the above, since all other messages will have the "fairy" property.
    console.log('π§ββοΈ Sylph Sifts!', JSON.parse(JSON.stringify(Msg)));
    const Sift = (Msg['πΊοΈ']) ? window[`${Msg['πΊοΈ']}Sift`](Msg) : {Failed: true, String: "β Sylph got lost!"}; // Bye bye switch and let!
    // This way we catch two types of errors: return values from the functions, or unrecognized websites (seems impossible, but still.)
    if (Sift.String.startsWith('β')) chrome.runtime.sendMessage({...Msg, 'β': Sift.String}); 
    if (Sift.Failed) return;    // This allows us to give the error message but continue, in a hypthetical case that we still don't have.
    const LancerURI = `${LancerWebApp}${Sift.String}&ex=${(Msg['π'] || '')}`;  // It's sent in every case, so we must convert undefined.
    console.log('π§ββοΈ -> π§ββοΈ\n'+LancerURI);
    const Lancer = new XMLHttpRequest();    // All this could in theory be delegated to the service worker, and done with fetch.
    Lancer.onreadystatechange = () => {
        if (Lancer.readyState !== XMLHttpRequest.DONE) return;  // Negative check to save on indentation.
        console.log(Lancer.status, Lancer.response);
        const Row = Lancer.response.split(':')[0].slice(-4);
        if (Lancer.status == 200) chrome.runtime.sendMessage({...Msg, 'βοΈ': Lancer.response, 'π': Row});
        else chrome.runtime.sendMessage({...Msg, 'β': Lancer.response});
    }
    Lancer.open('GET', LancerURI, true);
    Lancer.send();
});
