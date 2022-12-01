// It got much, much easier than the first version, but still a bit tricky sometimes.

function SiftLinked(position : string, page: string) : string {
    if (page.includes("/jobs/")) {
        const LINK = document.URL.split('?')[0];
        const NAME = document.title.split(' | ')[0].startsWith("(") ? document.title.split(' | ')[0].substring(4) : document.title.split(' | ')[0];
        const PERSON = document.querySelector('span.jobs-poster__name') ? 
            (document.querySelector('span.jobs-poster__name') as HTMLElement).innerText.trim() : 'NA';
        const PERSON_LINK = document.querySelector('.hirer-card__hirer-information') ?
            ((document.querySelector('.hirer-card__hirer-information')!.children[0] as HTMLElement)!.getAttribute('href') as string) : 'NA';
        const COMPANY = (document.querySelector('.jobs-unified-top-card__company-name') as HTMLElement)!.innerText;
        const COMPANY_LINK = document.URL.split('/jobs')[0]+
            document.querySelector('.jobs-unified-top-card__company-name')!.children[0].getAttribute('href');
        let COMPANY_SIZE = (document.querySelectorAll('.jobs-unified-top-card__job-insight')[1] as HTMLElement).innerText.split(' · ')[0];
        switch (COMPANY_SIZE.split('-')[0]) {
            case '1': COMPANY_SIZE = '2'; break;
            case '11': COMPANY_SIZE = '4'; break;
            case '51': COMPANY_SIZE = '5'; break;
            case '201': COMPANY_SIZE = '3'; break;
            case '501': COMPANY_SIZE = '2'; break;
            default: COMPANY_SIZE = '1'; break;
        }
        const time_frame = (document.querySelector('.jobs-unified-top-card__posted-date') as HTMLElement) ? 
            (document.querySelector('.jobs-unified-top-card__posted-date') as HTMLElement).innerText.split(' ')[1] : null;
        let DATE = 'Closed';
        if (time_frame) {
            let time = parseInt((document.querySelector('.jobs-unified-top-card__posted-date') as HTMLElement).innerText.split(' ')[0]);
            let today = new Date();
            switch (time_frame.substring(0,3)) {
                case 'day': DATE = new Date(today.getTime()-(time*86400000)).toDateString(); break;
                case 'wee': DATE = new Date(today.getTime()-(time*604800000)).toDateString(); break;
                default: DATE = (document.querySelector('.jobs-unified-top-card__posted-date') as HTMLElement).innerText; break;
            }
        }
        let location = (document.querySelector('.jobs-unified-top-card__bullet') as HTMLElement).innerText.split(',');
        const LOCATION = location[location.length - 1].trim();
        let APPLICANTS = 'NA';
        if (document.querySelector(".jobs-unified-top-card__applicant-count"))
            APPLICANTS = (document.querySelector(".jobs-unified-top-card__applicant-count") as HTMLElement).innerText.split(' ')[0];
        else if (document.querySelectorAll(".jobs-unified-top-card__bullet")[1]) {
            let applicants = (document.querySelectorAll(".jobs-unified-top-card__bullet")[1] as HTMLElement).innerText.split(' ');
            applicants.forEach((word) => { if (!isNaN(parseInt(word))) APPLICANTS = word });
        }
        const PARAM_STRING = 
            'name='+encodeURIComponent(NAME)+'&url='+LINK+'&loc='+LOCATION+'&date='+DATE+'&person='+PERSON+
            '&app='+APPLICANTS+'&personlink='+PERSON_LINK+'&comp='+COMPANY+'&complink='+COMPANY_LINK+'&compsize='+COMPANY_SIZE
        return PARAM_STRING;  
    }
    else {
        let SKILLS = 'NA';
        let ENGLISH = 'NA';
        if (document.querySelectorAll("a[data-field='skill_card_skill_topic']").length) {
            var Sifted: Array<string> = [];
            for (var i=0; i<3; i++) {
                Sifted.push(' '+
                (document.querySelectorAll("a[data-field='skill_card_skill_topic']")[i] as HTMLElement)
                    .innerText.split("\n")[0]);
            }

            const Hidden = document.querySelectorAll(".visually-hidden");
            var Collated = " · ";
            for (i=0; i < Hidden.length; i++) {
                let String: string = (Hidden[i] as HTMLElement).innerText;
                if (String.includes("Skills:") && String.includes("·")) 
                    Collated = Collated+String.substring(8)+" · ";
                else if (String === "English") ENGLISH = (Hidden[i+1] as HTMLElement).innerText;
            }

            var SubSkills = Collated.split(" · ");
            for (i=0; i<SubSkills.length; i++) {
                if (Sifted.indexOf(' '+SubSkills[i]) == -1 && Sifted[i] != '') Sifted.push(' '+SubSkills[i]);
            }

            SKILLS = Sifted.toString().substring(1);
        }
        const NAME = (document.querySelector(".text-heading-xlarge") as HTMLElement).innerText
        const STATUS = (document.querySelector("button[aria-label='Withdraw invitation sent to "+NAME+"']")) ? 
            "2.Sent 1st message" : '0.New';
        const POSITION = position;
        const LINK = document.URL;

        const PARAM_STRING = 'name='+NAME+'&pos='+encodeURIComponent(POSITION)+'&status='+STATUS+'&skills='+encodeURIComponent(SKILLS)
        +'&eng='+ENGLISH+'&rate=NA&loc=NA&url='+LINK+'&more=';
        return PARAM_STRING;
    }
}