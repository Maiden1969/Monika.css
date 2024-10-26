function addShadowPopBr(event) {
    event.target.classList.add("monika-anim-shadow-pop-br");
    event.target.classList.remove("monika-anim-shadow-pop-br-reverse");
};

function removeShadowPopBr(event) {
    event.target.classList.add("monika-anim-shadow-pop-br-reverse");
    event.target.classList.remove("monika-anim-shadow-pop-br");
}