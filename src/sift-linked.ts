// It got much, much easier than the first version, but still a bit tricky sometimes.

function SiftLinked(position : string, page: string) {
    if (page.includes("/jobs/")) {
        LINK = document.URL.split('?')[0];
        NAME = document.title.split(' | ')[0];
        if (NAME.startsWith("(")) NAME = NAME.substring((4));
        if (document.querySelector('span.jobs-poster__name'))
            PERSON = (document.querySelector('span.jobs-poster__name') as HTMLElement).innerText.trim();
        if (document.querySelector('.hirer-card__hirer-information'))
            PERSON_LINK = ((document.querySelector('.hirer-card__hirer-information')!
                .children[0] as HTMLElement)!.getAttribute('href') as string);
        COMPANY = (document.querySelector('.jobs-unified-top-card__company-name') as HTMLElement)!.innerText;
        COMPANY_LINK = document.URL.split('/jobs')[0]+
            document.querySelector('.jobs-unified-top-card__company-name')!.children[0].getAttribute('href');
        COMPANY_SIZE = (document.querySelectorAll('.jobs-unified-top-card__job-insight')[1] as HTMLElement)
            .innerText.split(' · ')[0];
        switch (COMPANY_SIZE.split('-')[0]) {
            case '1': COMPANY_SIZE = '3'; break;
            case '11': COMPANY_SIZE = '5'; break;
            case '51': COMPANY_SIZE = '4'; break;
            case '201': COMPANY_SIZE = '3'; break;
            case '501': COMPANY_SIZE = '2'; break;
            default: COMPANY_SIZE = '1'; break;
        }
        let time_frame = (document.querySelector('.jobs-unified-top-card__posted-date') as HTMLElement)
            .innerText.split(' ')[1];
        let time = parseInt((document.querySelector('.jobs-unified-top-card__posted-date') as HTMLElement)
            .innerText.split(' ')[0]);
        let today = new Date();
        switch (time_frame.substring(0,3)) {
            case 'day': DATE = new Date(today.getTime()-(time*86400000)).toDateString(); break;
            case 'wee': DATE = new Date(today.getTime()-(time*604800000)).toDateString(); break;
            default: DATE = (document.querySelector('.jobs-unified-top-card__posted-date') as HTMLElement)
                .innerText; break;
        }
        let location = (document.querySelector('.jobs-unified-top-card__bullet') as HTMLElement)
            .innerText.split(',');
        LOCATION = location[location.length - 1].trim()
        APPLICANTS = (document.querySelector(".jobs-unified-top-card__applicant-count") as HTMLElement)
            .innerText.split(' ')[0];
    }
    else {
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
        NAME = (document.querySelector(".text-heading-xlarge") as HTMLElement).innerText
        if (document.querySelector("button[aria-label='Withdraw invitation sent to "+NAME+"']")) 
            STATUS = "2.Sent 1st message";
        POSITION = position;
        LINK = document.URL;
    }
}