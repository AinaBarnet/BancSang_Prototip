// Datos ficticios iniciales
const defaultProfile = {
    name: 'Laura García',
    donations: 5,
    lastDonation: '10/12/2025',
    groups: [
        { name: "Grup de la Laura", joined: '02/03/2024' },
        { name: 'Voluntaris BCN', joined: '10/11/2024' },
        { name: 'Amics - Donacions', joined: '22/06/2025' }
    ]
};

function getProfile(){
    try{
        const raw = localStorage.getItem('profileData');
        if(!raw) return defaultProfile;
        return JSON.parse(raw);
    }catch(e){
        console.error('Error parsing profile data', e);
        return defaultProfile;
    }
}

function saveProfile(profile){
    localStorage.setItem('profileData', JSON.stringify(profile));
}

function renderProfile(){
    const p = getProfile();
    document.getElementById('displayName').textContent = p.name;
    document.getElementById('headerUserName').textContent = p.name.split(' ')[0] || p.name;
    document.getElementById('donationCount').textContent = p.donations;
    document.getElementById('lastDonation').textContent = p.lastDonation;
    document.getElementById('nameInput').value = p.name;

    const ul = document.getElementById('groupsList');
    ul.innerHTML = '';
    p.groups.forEach(g =>{
        const li = document.createElement('li');
        li.className = 'group-item';
        li.innerHTML = `<div class="group-name">${escapeHtml(g.name)}</div><div class="group-date">${escapeHtml(g.joined)}</div>`;
        ul.appendChild(li);
    });

    const avatar = document.querySelector('.profile-avatar');
    if(avatar) avatar.textContent = (p.name || 'U').trim()[0].toUpperCase();
}

function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(m){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[m];
    });
}

document.addEventListener('DOMContentLoaded', ()=>{
    renderProfile();

    document.getElementById('saveName').addEventListener('click', ()=>{
        const name = document.getElementById('nameInput').value.trim();
        if(!name) return alert('Introdueix un nom vàlid');
        const p = getProfile();
        p.name = name;
        saveProfile(p);
        renderProfile();
    });

    document.getElementById('resetName').addEventListener('click', ()=>{
        localStorage.removeItem('profileData');
        renderProfile();
    });
});
