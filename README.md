# Sylph

Sylph is a Chrome Extension that sifts data from a few popular websites, and sends it to a web app done in Google Apps Script, which in turn sends it to a Google Sheet.

This is my first project, so the code will be considered very dirty for sure, but it gets the job done.


## Instructions


Please note that if you "try this at home" as it is, it won't work, because it referes to a deployed version of my web app Lancer (https://github.com/sci-barite/lancer), the URL of which I kept in a lancer.ts file not uploaded on the repo.

To make it work, you should deploy your own version of Lancer, and put the URL of the deployment in a LancerWebApp string, declared in a lancer.ts file.

You can try to do this following the instructions in Lancer's readme file, but you'd probably be better off writing your own version of it, to adapt to the needs of your own Google Sheet.

Here is an example of how it would work when properly set up:

![Working with Sylph video](https://cdn-images-1.medium.com/max/800/0*zSQ_aYJ2K_1St3sV.gif)

Enjoy! :)