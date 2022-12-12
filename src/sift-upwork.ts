// Longer than it should be, because there are two different kinds of pages I want to be able to sift through.
function SiftUpwork(pos: string, url : string) : {Failed: boolean, String: string} {
    if (url.includes("proposal")) return SiftUpworkProposal(url);
    else return SiftUpworkProfile(pos, url);
}

// The proposal version ists inside an overlay container.
function SiftUpworkProposal(url: string) : {Failed: boolean, String: string} {
    const Container = document.querySelector(".up-slider");

    const NAME = (Container?.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();
    const LOCATION = (Container?.querySelectorAll(".d-inline-block")[3] as HTMLElement).innerText;
    const RATE = (Container?.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();
    const LINK = url;
    const Skills = (Container?.querySelectorAll(".skills") as NodeList)
    const Sifted: string[] = [];
    const UselessSkills = ['Skills', 'Development', 'Business'];
    if (Skills[0]) { // It's inconsistent: sometimes it's 0, sometimes 1. Length is key.
        const SubSkills = ((Skills[0] as HTMLElement).innerText.split("\n").length > 20 && Container?.querySelectorAll(".skills")[1]) ?
            (Skills[1] as HTMLElement).innerText.split("\n") : (Skills[0] as HTMLElement).innerText.split("\n")
        Sifted.concat(SubSkills.filter(skill => !UselessSkills.some(useless => skill.includes(useless))));
    }
    else if (Container?.querySelectorAll("div[data-test='ontology-attribute-group-tree-viewer-wrapper'")[1]) {
        const SubSkills = (Container.querySelectorAll("div[data-test='ontology-attribute-group-tree-viewer-wrapper'")[1] as HTMLElement)
            .innerText.split("\n")
        Sifted.concat(SubSkills.filter(skill => !UselessSkills.some(useless => skill.includes(useless))));
    }
    else Sifted.push(' ERR: Could not parse any skill!');
    const SKILLS = Sifted.toString().replaceAll(',', ', ');
    
    const POSITION = (Container?.querySelectorAll(".break")[0] as HTMLElement).innerText.trim();
    const ENGLISH = (Container?.querySelectorAll("div[data-test='language'")[0] as HTMLElement).innerText.split(":")[1].trim()
    const MORE = (Container?.querySelector("a.d-block") as HTMLElement).toString().substring(12) // Trying to avoid GET limits...

    const PARAM_STRING = 'name='+NAME+'&pos='+encodeURIComponent(POSITION)+'&status=0.New&skills='+encodeURIComponent(SKILLS)
    +'&eng='+ENGLISH+'&rate='+RATE+'&loc='+LOCATION+'&url='+LINK+'&more='+MORE;
    return {Failed: false, String: PARAM_STRING};
}

function SiftUpworkProfile(pos: string, url: string) : {Failed: boolean, String: string} {
    const NAME = (document.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();
    const LOCATION = (document.querySelectorAll(".d-inline-block")[3] as HTMLElement).innerText;
    const RATE = (document.querySelectorAll(".d-inline")[1] as HTMLElement).innerText.trim();
    const LINK = url;
    const UselessSkills = ['Skills', 'Development', 'Business'];
    const SubSkills = (document.querySelectorAll(".skills")[0] as HTMLElement).innerText.split("\n")
        .filter(skill => !UselessSkills.some(useless => skill.includes(useless)));
    const SKILLS = SubSkills.toString().replaceAll(',', ', ');

    const POSITION = pos; 
    /** Keeping the old code below, so later it can be activated via settings/options.
    if (document.querySelectorAll(".up-card")[3].querySelector("em.break"))
        POSITION = (document.querySelectorAll(".up-card")[3].querySelector("em.break") as HTMLElement).innerText;
    else POSITION = (document.querySelectorAll("h2.mb-0")[1] as HTMLElement).innerText.trim();
     */
    const lists = document.querySelectorAll(".list-unstyled");
    const ENGLISH = (lists[1].querySelector("span.d-inline-block") as HTMLElement).innerText

    const PARAM_STRING = 'name='+NAME+'&pos='+encodeURIComponent(POSITION)+'&status=0.New&skills='+encodeURIComponent(SKILLS)
    +'&eng='+ENGLISH+'&rate='+RATE+'&loc='+LOCATION+'&url='+LINK+'&more=';
    return {Failed: false, String: PARAM_STRING};
}
