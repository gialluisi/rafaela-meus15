document.addEventListener("DOMContentLoaded", () => {
    const selectedItems = [];
    const selectedList = document.getElementById("selectedList");
    const selectedCount = document.getElementById("selectedCount");
    const totalValue = document.getElementById("totalValue");
    const pixButton = document.getElementById("btnPix");
    const mercadoButton = document.getElementById("btnMercado");
    const pixPanel = document.getElementById("pixPanel");
    const mercadoPanel = document.getElementById("mercadoPanel");
    const copyPixButton = document.getElementById("copyPix");
    const sendMessageButton = document.getElementById("sendMessage");   
    const messageStatus = document.getElementById("messageStatus");

    createStars();
    startCountdown();
    bindGiftButtons();
    bindPaymentButtons();
    bindCopyPix();
    bindMessageForm();

    function createStars() {
        const stars = document.getElementById("stars");
        if (!stars) return;
        for (let i = 0; i < 180; i += 1) {
            const star = document.createElement("div");
            const size = Math.random() * 2 + 1;
            star.className = "star";
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            star.style.animationDuration = `${2 + Math.random() * 4}s`;
            stars.appendChild(star);
        }
    }

    function startCountdown() {
        const tripDate = new Date("2027-01-07T08:00:00-03:00").getTime();
        const fields = ["days", "hours", "minutes", "seconds"].map((id) => document.getElementById(id));
        function updateCountdown() {
            const distance = Math.max(0, tripDate - Date.now());
            const values = [Math.floor(distance / 86400000), Math.floor((distance % 86400000) / 3600000), Math.floor((distance % 3600000) / 60000), Math.floor((distance % 60000) / 1000)];
            fields.forEach((field, index) => {
                if (field) field.textContent = index === 0 ? values[index] : String(values[index]).padStart(2, "0");
            });
        }
        updateCountdown();
        window.setInterval(updateCountdown, 1000);
    }

    function bindGiftButtons() {
        document.querySelectorAll(".gift-btn").forEach((button) => {
            button.addEventListener("click", () => {
                const item = button.dataset.item;
                const value = Number(button.dataset.value);
                const index = selectedItems.findIndex((experience) => experience.item === item);
                if (index >= 0) {
                    selectedItems.splice(index, 1);
                    button.classList.remove("selected");
                    button.textContent = "🎁 Adicionar à viagem";
                } else {
                    selectedItems.push({ item, value });
                    button.classList.add("selected");
                    button.textContent = "✓ Experiência adicionada";
                }
                renderContribution();
            });
        });
    }

    function renderContribution() {
        if (!selectedList || !selectedCount || !totalValue) return;
        selectedList.replaceChildren();
        selectedCount.textContent = selectedItems.length;
        const total = selectedItems.reduce((sum, experience) => sum + experience.value, 0);
        totalValue.textContent = total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (!selectedItems.length) {
            selectedList.innerHTML = '<p class="empty">Nenhuma experiência selecionada.</p>';
            return;
        }
        selectedItems.forEach((experience) => {
            const selectedItem = document.createElement("div");
            selectedItem.className = "selected-item";
            selectedItem.innerHTML = `<div><strong>${experience.item}</strong><small>Presente sugerido</small></div><h4>R$ ${experience.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h4>`;
            selectedList.appendChild(selectedItem);
        });
    }

    function bindPaymentButtons() {
        function showPayment(method) {
            const isPix = method === "pix";
            if (!pixButton || !mercadoButton || !pixPanel || !mercadoPanel) return;
            pixButton.classList.toggle("active", isPix);
            mercadoButton.classList.toggle("active", !isPix);
            pixButton.setAttribute("aria-pressed", String(isPix));
            mercadoButton.setAttribute("aria-pressed", String(!isPix));
            pixPanel.classList.toggle("hidden", !isPix);
            mercadoPanel.classList.toggle("hidden", isPix);
            pixPanel.hidden = !isPix;
            mercadoPanel.hidden = isPix;
        }
        pixButton?.addEventListener("click", () => showPayment("pix"));
        mercadoButton?.addEventListener("click", () => showPayment("mercado"));
        }

    function bindCopyPix() {
        copyPixButton?.addEventListener("click", async () => {
            const input = document.getElementById("pixKey");
            if (!input?.value) return;
            try {
                if (!navigator.clipboard?.writeText) throw new Error("Clipboard indisponível");
                await navigator.clipboard.writeText(input.value);
            } catch {
                input.focus();
                input.select();
                input.setSelectionRange(0, input.value.length);
                document.execCommand("copy");
            }
            copyPixButton.textContent = "✓ Chave PIX copiada";
            window.setTimeout(() => { copyPixButton.textContent = "📋 Copiar chave PIX"; }, 2500);
        });
    }
function setMessageStatus(message, type) {

    if (!messageStatus) return;

    messageStatus.textContent = message;

    messageStatus.className = `form-status ${type}`;

}
function bindMessageForm() {
      console.log("bindMessageForm foi chamada");
    sendMessageButton?.addEventListener("click", async () => {
         console.log("Clique no botão");
        const name = document.getElementById("guestName")?.value.trim();
        const email = document.getElementById("guestEmail")?.value.trim();
        const message = document.getElementById("guestMessage")?.value.trim();
         console.log(name, email, message);

        if (!name || !email || !message) {
            return setMessageStatus(
                "Preencha seu nome, e-mail e mensagem para enviar.",
                "error"
            );
        }
        const config = window.RAFAELA_CONFIG?.emailjs;

        if (
            !config?.publicKey ||
            !config?.serviceId ||
            !config?.templateId ||
            !window.emailjs
        ) {
            return setMessageStatus(
                "O envio por e-mail ainda precisa ser configurado.",
                "error"
            );

        }

        sendMessageButton.disabled = true;
        sendMessageButton.textContent = "Enviando...";

        try {
console.log("Vai enviar EmailJS");
            await window.emailjs.send(

                config.serviceId,

                config.templateId,

                {

                    to_email: window.RAFAELA_CONFIG.recipientEmail,

                    from_name: name,

                    reply_to: email,

                    message: message,

                    selected_experiences:

                        selectedItems.length

                            ? selectedItems
                                  .map(item => item.item)
                                  .join(", ")

                            : "Nenhuma experiência selecionada",

                    suggested_total:

                        selectedItems
                            .reduce((sum, item) => sum + item.value, 0)
                            .toLocaleString("pt-BR", {

                                style: "currency",

                                currency: "BRL"

                            })

                },

                config.publicKey

            );
console.log("Email enviado");
            setMessageStatus(

                "Mensagem enviada para a Rafaela! ❤️ Agora escolha a forma de pagamento abaixo.",

                "success"

            );

            document.getElementById("guestName").value = "";
            document.getElementById("guestEmail").value = "";
            document.getElementById("guestMessage").value = "";

            setTimeout(() => {

                document
                    .querySelector(".payment-section")
                    ?.scrollIntoView({

                        behavior: "smooth",

                        block: "start"

                    });

            }, 1800);

        }

catch(error){

    console.log("Entrou no catch");

    console.error(error);

}
        finally {

            sendMessageButton.disabled = false;

            sendMessageButton.textContent = "❤️ Enviar mensagem";

        }

    });

}
})