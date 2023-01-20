// The only tricky thing here is it uses the same parameters for different things. Now that we return the params, we could make this better.
function apolloSift(Msg: {[key: string]: any}) : {Failed:boolean, String:string} {
    if (!document.querySelector('#location_detail_card')) {
        if (!document.querySelectorAll("tr.zp_cWbgJ").length)
            return {Failed: true, String: '❌ She sees no human here!'};
        else return apolloListSift()
    }
    
    const Signals : NodeListOf<HTMLElement> = document.querySelectorAll(".zp_KqZzF");
    Signals.forEach(elem => { if (elem.innerText.includes('Job')) elem!.click()}); // Click to display jobs!
    
    const compLinks = document.querySelector(".zp_I1ps2");
    if (!compLinks) return {Failed: true, String: '❌ She sees no account associated to this human!'};
    const COMPANY_LINK = (compLinks.childNodes[0] as HTMLElement).attributes[1].value;
    const COMPANY = compLinks.childNodes[1] ? (compLinks.childNodes[1] as HTMLElement).attributes[1].value : COMPANY_LINK;
    const linkedIn = Array.from(document.querySelectorAll("a.zp-link.zp_OotKe")).filter(ahref => {
        if (ahref.attributes[1]) return ahref.attributes[1].value.includes("linkedin")
    });
    const PERSON_LINK = (linkedIn[0] as HTMLElement).attributes[1].value;
    const PERSON = document.querySelector("a.zp-link.zp_OotKe.zp_dAPkM.zp_Iu6Pf") ? 
        (document.querySelector("a.zp-link.zp_OotKe.zp_dAPkM.zp_Iu6Pf") as HTMLElement).innerText :  // Credit used override: Email
        (document.querySelector(".zp_lMvaV.zp_JKOw3") as HTMLElement).innerText.trim();  // Fallback (new contact): Company name
    const APPLICANTS = document.querySelector("a.zp-link.zp_3_fnL.zp_1AaQP") ? 
        (document.querySelector("a.zp-link.zp_3_fnL.zp_1AaQP") as HTMLElement).innerText : // Credit used override: Phone
        (document.querySelector(".zp_LkFHT") as HTMLElement).innerText.trim(); // Fallback (new contact): Position
    const LOCATION = document.querySelector(".zp_I78N2")? (document.querySelector(".zp_I78N2") as HTMLElement).innerText : 'NA';
    const COMPANY_SIZE = document.querySelector(".zp_nowuD.zp_a_Jcv") ? 
        (document.querySelector(".zp_nowuD.zp_a_Jcv") as HTMLElement).innerText : 'NA';
    const positions = ['ngineer', 'eveloper', 'esigner', 'ester', 'rogrammer'];
    const Jobs = Array.from(document.querySelectorAll(".zp-link.zp_OotKe"))
        .filter(elem => positions.some(position => (elem as HTMLElement).innerText.includes(position)));
    const MORE = Jobs.map(elem => elem.innerHTML.split('" target')[0].split('href="')[1].split('?')[0]);
    const DATE = Jobs.length; // Comments
    const NAME = document.title.split(" - Apollo")[0];
    const LINK = (document.URL.includes('contacts') ? "apollo/contacts/" : "apollo/people/")+document.URL.substring(document.URL.length -24);

    const PARAM_STRING : string = 'name='+encodeURIComponent(NAME)+'&url='+LINK+'&loc='+LOCATION+'&date='+DATE+'&person='+PERSON+
            '&app='+APPLICANTS+'&personlink='+PERSON_LINK+'&comp='+COMPANY+'&complink='+COMPANY_LINK+'&compsize='+COMPANY_SIZE+'&more='+MORE;
    return {Failed: false, String: PARAM_STRING};  
}

function apolloListSift() : {Failed:boolean, String:string} {
    //const List: {[key: string]: string[][]}[] = [{Header: []}];

    //List[0].Header = Array.from(document.querySelectorAll("th"))?.map(th => [(th as HTMLElement).innerText]);
    /**
    document.querySelectorAll("tr.zp_cWbgJ")
    .forEach((tr, row) => { row = row+1; List.push({['Row'+row]: []}); tr.childNodes
        .forEach((td, col) => {const elem = td as HTMLElement; List[row]['Row'+row].push([elem.innerText]); td.childNodes
            .forEach(child => {
                const hrefs = (child as HTMLElement).innerHTML.match(/href="(.+?)"/g)?.map(str => str.split("\"")[1]) ?? [];
                hrefs.forEach(href => List[row]['Row'+row][col].push(href.toString()));
            });
        });
    }); */

    const test : {[key: string]: string}[] = [];
    const Header = Array.from(document.querySelectorAll("th"))?.map(th => (th as HTMLElement).innerText);
    const Columns = Header.map(column => column.includes(' ') ? column.split(' ')[1] : column);

    document.querySelectorAll("tr.zp_cWbgJ").forEach((tr, Row) => {
        test.push({});
        tr.childNodes.forEach((td, col) => {
            const elem = td as HTMLElement; test[Row][Columns[col]] = elem.innerText; 
            td.childNodes.forEach(child => {
                const hrefs = (child as HTMLElement).innerHTML.match(/href="(.+?)"/g)?.map(str => str.split("\"")[1]) ?? [];
                hrefs.forEach(href => {
                    if (href.includes('linkedin')) test[Row][Columns[col]+'_linkedin'] = href.toString();
                    else if (href.includes('#')) test[Row][Columns[col]+'_apollo'] = href.toString();
                    else if (!href.includes('facebook') && !href.includes('twitter')) test[Row][Columns[col]+'_web'] = href.toString();
                });
            });
        });
    });
    console.log(Columns);
    //if (test.length > 1) return {Failed: true, String: '❌ Just testing: '+JSON.stringify(test)};

    return {Failed: true, String: JSON.stringify(test)}
}