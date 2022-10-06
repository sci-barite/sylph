// The longest of the three, because it can do two different kinds of pages.

function SiftUpwork(pos: string, url : string) {
    LINK = url;
    var Sifted: Array<string> = [];
    var SubSkills: Array<string> = [];
    if (url.includes("proposal")) {
        const Container = document.querySelector(".up-slider");

        NAME = (Container?.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();
        LOCATION = (Container?.querySelectorAll(".d-inline-block")[3] as HTMLElement).innerText;
        RATE = (Container?.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();

        const Skills = (Container?.querySelectorAll(".skills") as NodeList)

        if (Skills[0]) { // It's inconsistent: sometimes it's 0, sometimes 1. Length is key.
            SubSkills = (Skills[0] as HTMLElement).innerText.split("\n");
            if (SubSkills.length > 20 && Container?.querySelectorAll(".skills")[1]) 
                SubSkills = (Skills[1] as HTMLElement).innerText.split("\n");
            for (var i=0; i<SubSkills.length; i++) if (!SubSkills[i].includes("Skills")) Sifted.push(' '+SubSkills[i]);
        }
        else if (Container?.querySelectorAll("div[data-test='ontology-attribute-group-tree-viewer-wrapper'")[1]) {
            SubSkills = 
            (Container.querySelectorAll("div[data-test='ontology-attribute-group-tree-viewer-wrapper'")[1] as HTMLElement).innerText.split("\n")
            for (i=0; i<SubSkills.length; i++) 
                if (!SubSkills[i].includes("Skills") && !SubSkills[i].includes("Development") && !SubSkills[i].includes("Business"))
                    Sifted.push(' '+SubSkills[i]);
        }
        else Sifted.push(' ERR: Could not parse any skill!');
        SKILLS = Sifted.toString().substring(1);
        
        POSITION = (Container?.querySelectorAll(".break")[0] as HTMLElement).innerText.trim();
        ENGLISH = (Container?.querySelectorAll("div[data-test='language'")[0] as HTMLElement).innerText.split(":")[1].trim()
        MORE = (Container?.querySelector("a.d-block") as HTMLElement).toString().substring(12) // Keeping it shorter to avoid GET limits...
    }
    else {
        NAME = (document.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();
        LOCATION = (document.querySelectorAll(".d-inline-block")[3] as HTMLElement).innerText;
        RATE = (document.querySelectorAll(".d-inline")[1] as HTMLElement).innerText.trim();

        SubSkills = (document.querySelectorAll(".skills")[0] as HTMLElement).innerText.split("\n");
        for (i=0; i<SubSkills.length; i++) if (!SubSkills[i].includes("Skills")) Sifted.push(' '+SubSkills[i]);
        SKILLS = Sifted.toString().substring(1);

        POSITION = pos; // Keeping the old code, so later it can be activated via settings/options.
        /**
        if (document.querySelectorAll(".up-card")[3].querySelector("em.break"))
            POSITION = (document.querySelectorAll(".up-card")[3].querySelector("em.break") as HTMLElement).innerText;
        else POSITION = (document.querySelectorAll("h2.mb-0")[1] as HTMLElement).innerText.trim();
         */
        const lists = document.querySelectorAll(".list-unstyled");
        ENGLISH = (lists[1].querySelector("span.d-inline-block") as HTMLElement).innerText
    }
} 