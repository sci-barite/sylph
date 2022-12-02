// This is to check for existing entries of the job. The 'Go' assigned to Lancer doesn't matter, we check for presence of the key.
window.onload = () => {
    if (document.URL.includes("in.com/jobs/view")) chrome.runtime.sendMessage({'🧚‍♀️': 'LancerSummon', '🧜‍♂️': LancerWebApp, '🌍': document.URL});
}
// All the work is done by this listener, and the functions it calls (from scripts that are injected selectively depending on the website.)
chrome.runtime.onMessage.addListener(Sylph => {
    if (Sylph['🧚‍♀️'] == 'SiftSpell') {
        console.log('🧚‍♀️ Sylph Sifts!', Sylph);
        let SiftedParams : string;
        switch (Sylph['🌍'].substring(12,18)) {
            case "linked": SiftedParams = SiftLinked(Sylph['🗂'], Sylph['🌍']); break; // The function checks if it's a profile or job.
            case "ni.co/": SiftedParams = SiftDjinni(Sylph['🗂']); break;              // This one uses the folder only on one condition.
            case "apollo": SiftedParams = SiftApollo(Sylph['🌍']); break;               // This had two different modes depending on the URL.
            case "upwork": SiftedParams = SiftUpwork(Sylph['🗂'], Sylph['🌍']); break; // The function checks if it's a profile or proposal.
            default: alert(Sylph.Place.substring(12,18)+": This portion of the URL is not recognized!"); return;
        }
        const LancerURI = LancerWebApp + SiftedParams + '&ex='+Sylph['💌'];
        if (Sylph['💌']) console.log('🧜‍♂️ Lancer has a record of this at '+(parseInt(Sylph['💌'])+2)+'!');
        console.log('🧚‍♀️ -> 🧜‍♂️\n'+LancerURI);
        const Lancer = new XMLHttpRequest();
        Lancer.onreadystatechange = () => {
            if (Lancer.readyState === XMLHttpRequest.DONE) {
                console.log(Lancer.response);
                if (Lancer.status === 200) chrome.runtime.sendMessage({'🧚‍♀️': 'SpellSuccessful', '🧜‍♂️': Lancer.response, '🗂': Sylph['🗂']});
                else if (Lancer.status === 0 || (Lancer.status > 200 && Lancer.status < 400)) 
                    chrome.runtime.sendMessage({'🧚‍♀️': 'SpellFailed', '🧜‍♂️': Lancer.response, '🗂': Sylph['🗂']});   
                else chrome.runtime.sendMessage({'🧚‍♀️': 'SpellFailed', '🗂': Sylph['🗂']}); // In this case, Lancer must not have been reached.
            }
        }
        Lancer.open('GET', LancerURI, true);
        Lancer.send();
    }
});
