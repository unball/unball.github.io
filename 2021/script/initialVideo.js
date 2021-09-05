// Initial video

class InitialVideo {
    constructor(selector){
        this.video = document.querySelector(selector);

        this.video.addEventListener("ended", () => {
            this.video.style.display = "none";
        });
    }
}