// The only tricky thing here is it uses the same parameters for different things. Now that we return the params, we could make this better.
function apolloSift(Msg: {[key: string]: any}) : {Failed:boolean, String:string} {
    const apolloContact = {
        signalsPanelEntries: '.zp_KqZzF', compLinks: '.zp_I1ps2', allLinks: 'a.zp-link.zp_OotKe', 
        emailLink: "a.zp-link.zp_OotKe.zp_dAPkM.zp_Iu6Pf", compName: '.zp_lMvaV.zp_JKOw3', phone: 'a.zp-link.zp_3_fnL.zp_1AaQP',
        position: '.zp_LkFHT', location: '.zp_hYCdb.zp_CZF_z', employees: '.zp_nowuD.zp_a_Jcv', name: '.zp__iJHP', 
        condition1: '#location_detail_card', condition1a: 'tr.zp_cWbgJ', condition2: '.zp_I1ps2',
        error1: '❌ She sees no human!', error2: '❌ She sees no account!', alternativeSift: 'apolloListSift',
        outputURL1: 'apollo/contacts/', outputURL2: 'apollo/people/', uniqueIDstringLength: 24
    }
    const positions = ['ngineer', 'eveloper', 'esigner', 'ester', 'rogrammer'];

    if (!document.querySelector(apolloContact.condition1)) {
        if (!document.querySelector(apolloContact.condition1a))   // Shows there is a table of (hopefully) contacts.
            return {Failed: true, String: apolloContact.error1};
        else return window[apolloContact.alternativeSift](apolloContact.condition1a);   // Very convoluted, but preparing for something big.
    }
    if (!document.querySelector(apolloContact.condition2))
        return {Failed: true, String: apolloContact.error2};
    
    const Signals : NodeListOf<HTMLElement> = document.querySelectorAll(apolloContact.signalsPanelEntries);
    Signals.forEach(signal => { if (signal.innerText.includes('Job')) signal!.click()}); // Click to display jobs!
    
    const compLinks = document.querySelector(apolloContact.compLinks);
    const COMPANY_LINK = (compLinks!.childNodes[0] as HTMLElement).attributes[1].value;
    const COMPANY = compLinks!.childNodes[1] ? (compLinks!.childNodes[1] as HTMLElement).attributes[1].value : COMPANY_LINK;
    const allLinks = Array.from(document.querySelectorAll(apolloContact.allLinks));
    const linkedIn = allLinks.filter(ahref => {
        if (ahref.attributes[1]) return ahref.attributes[1].value.includes("linkedin")
    });
    const PERSON_LINK = (linkedIn[0] as HTMLElement).attributes[1].value;
    const emailLink = document.querySelector(apolloContact.emailLink);
    const PERSON = emailLink ? 
        (emailLink as HTMLElement).innerText :  // Credit used override: Email
        (document.querySelector(apolloContact.compName) as HTMLElement).innerText.trim();  // Fallback (new contact): Company name
    const phoneLink = document.querySelector(apolloContact.phone)
    const APPLICANTS = phoneLink ? 
        (phoneLink as HTMLElement).innerText : // Credit used override: Phone
        (document.querySelector(apolloContact.position) as HTMLElement).innerText.trim(); // Fallback (new contact): Position
    const location = document.querySelector(apolloContact.location);
    const LOCATION = location ? (location as HTMLElement).innerText : 'NA';
    const employees = document.querySelector(apolloContact.employees);
    const COMPANY_SIZE = employees ? (employees as HTMLElement).innerText : 'NA';
    const Jobs = allLinks.filter(elem => positions.some(position => (elem as HTMLElement).innerText.includes(position)));
    const DATE = Jobs.length; // Comments
    const MORE = (DATE > 0) ? Jobs.map(elem => elem.attributes[1].value) : '';
    const NAME = (document.querySelector(apolloContact.name) as HTMLElement).innerText;
    const LINK = (document.URL.includes(apolloContact.outputURL1) ? apolloContact.outputURL1
         : apolloContact.outputURL2)+document.URL.substring(document.URL.length -apolloContact.uniqueIDstringLength);

    const PARAM_STRING : string = 'name='+encodeURIComponent(NAME)+'&url='+LINK+'&loc='+LOCATION+'&date='+DATE+'&person='+PERSON+
            '&app='+APPLICANTS+'&personlink='+PERSON_LINK+'&comp='+COMPANY+'&complink='+COMPANY_LINK+'&compsize='+COMPANY_SIZE+'&more='+MORE;
    return {Failed: false, String: PARAM_STRING};  
}

function apolloListSift(rowIdent: string) : {Failed:boolean, String:string} {
    const Table : {[key: string]: string}[] = [];
    const Header = Array.from(document.querySelectorAll("th"))?.map(th => (th as HTMLElement).innerText);
    if (!Header.includes('Title')) return {Failed: true, String: '❌ She sees no humans in this list!'};
    const Columns = Header.map(column => column.includes(' ') ? column.split(' ')[1] : column);
    
    document.querySelectorAll(rowIdent).forEach((tr, Row) => {
        Table.push({}); // An empty row is pushed first, to have an index to refer to, via Row.
        tr.childNodes.forEach((td, col) => {
            Table[Row][Columns[col]] = (td as HTMLElement).innerText;
            if (Columns[col] != 'Name' && Columns[col] != 'Company') return;    // No point in checking anything other than these two.
            const hrefs = (td as HTMLElement).innerHTML.match(/href="(.+?)"/g)?.map(str => str.split("\"")[1]) ?? [];
            hrefs.forEach(link => {
                if (link.includes('#')) Table[Row][Columns[col]+'_apollo'] = link;
                else if (link.includes('linkedin')) Table[Row][Columns[col]+'_linkedin'] = link;
                else if (!link.includes('facebook') && !link.includes('twitter')) Table[Row][Columns[col]+'_web'] = link;
            });
        });
    });

    return {Failed: true, String: JSON.stringify(Table)}
}