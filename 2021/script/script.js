// Integration
initialVideo = new InitialVideo(".full-screen-video");
logo3d = new Logo3d("#logo-container", './glb/logo.glb');

logo3d.load().then(_ => {
    // logo3d.start();
    // textContainer.style.opacity = 1;
    initialVideo.video.addEventListener("ended", () => {
        logo3d.start();
        textContainer.style.opacity = 1;
    });
})

