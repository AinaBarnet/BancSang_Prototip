// Small helper to hydrate the xat page with mock chats saved from personalizacion
function getQueryParam(name){
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

document.addEventListener('DOMContentLoaded', ()=>{
    let chats = [];
    try{
        const raw = localStorage.getItem('mockChats');
        if(raw) chats = JSON.parse(raw);
    }catch(e){ console.error('No mock chats', e); }

    const convList = document.getElementById('conversationsList');
    if(convList && chats.length){
        convList.innerHTML = '';
        chats.forEach(c=>{
            const btn = document.createElement('button');
            btn.className = 'conversation-item';
            const lastMsg = (c.messages && c.messages.length) ? c.messages[c.messages.length-1] : { text: '', time: '' };
            btn.innerHTML = `
                <div class="conversation-avatar">${(c.name||'U').trim()[0].toUpperCase()}</div>
                <div class="conversation-content">
                    <div class="conversation-header">
                        <h4>${escapeHtml(c.name)}</h4>
                        <div class="conversation-time">${escapeHtml(lastMsg.time || '')}</div>
                    </div>
                    <div class="conversation-preview">
                        <p>${escapeHtml(lastMsg.text || '')}</p>
                        <!-- optional badge placeholder -->
                        <div class="unread-badge" style="display:none;">0</div>
                    </div>
                </div>`;
            btn.addEventListener('click', ()=>{ window.location.href = `xat.html?chatId=${encodeURIComponent(c.id)}`; });
            convList.appendChild(btn);
        });
    }

    const chatId = getQueryParam('chatId');
    if(chatId){
        let chat = (chats.find(c=>c.id===chatId));
        if(!chat){
            // fallback: create a simple chat
            chat = { id: chatId, name: chatId, messages: [{sender:'system', text:'Inici de la conversa', time:'09:00'}] };
        }

        // show chat pane
        const chatActive = document.getElementById('chatActive');
        const chatWelcome = document.getElementById('chatWelcome');
        if(chatActive){ chatActive.style.display = 'block'; }
        if(chatWelcome){ chatWelcome.style.display = 'none'; }

        const chatName = document.getElementById('chatName');
        const chatAvatar = document.getElementById('chatAvatar');
        const chatMessages = document.getElementById('chatMessages');
        if(chatName) chatName.textContent = chat.name;
        if(chatAvatar) chatAvatar.textContent = (chat.name||'U').trim()[0].toUpperCase();
        if(chatMessages){
            chatMessages.innerHTML = '';
            (chat.messages||[]).forEach(m=>{
                const div = document.createElement('div');
                div.className = 'message-card-mock';
                div.innerHTML = `<div class="message-bubble"><strong>${escapeHtml(m.sender)}</strong><p>${escapeHtml(m.text)}</p><span class="msg-time">${escapeHtml(m.time)}</span></div>`;
                chatMessages.appendChild(div);
            });
        }
    }

    function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m];}); }
});
