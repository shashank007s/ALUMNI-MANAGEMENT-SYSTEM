const BASE_URL = "http://localhost:8080";

/* ================= REGISTER ================= */
async function register(){
    try{
        const res = await fetch(BASE_URL + "/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                password: document.getElementById("password").value,
                role: document.getElementById("role").value   // ADMIN / USER
            })
        });

        if(!res.ok) throw new Error("Registration failed");

        alert("Registration successful");
        window.location.href = "login.html";

    }catch(err){
        alert(err.message);
    }
}


/* ================= LOGIN ================= */
async function login(){
    try{
        const res = await fetch(BASE_URL + "/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: document.getElementById("email").value.trim(),
                password: document.getElementById("password").value
            })
        });

        if(!res.ok) throw new Error("Invalid email or password");

        const data = await res.json();

        // ✅ store token
        localStorage.setItem("token", data.token);

        // ✅ extract ROLE from token
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        localStorage.setItem("role", payload.role);

        alert("Login successful");

        // ✅ redirect based on role
        if(payload.role === "ROLE_ADMIN"){
            window.location.href = "dashboard.html";
        }else{
            window.location.href = "alumni.html";
        }

    }catch(err){
        alert(err.message);
    }
}


/* ================= ADD ALUMNI ================= */
async function addAlumni(){

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if(role !== "ROLE_ADMIN"){
        alert("Only ADMIN can add alumni ❌");
        return;
    }

    try{
        const res = await fetch(BASE_URL + "/alumni", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                phone: document.getElementById("phone").value.trim(),
                course: document.getElementById("course").value.trim(),
                passoutYear: parseInt(document.getElementById("passoutYear").value),
                company: document.getElementById("company").value.trim(),
                jobRole: document.getElementById("jobRole").value.trim()
            })
        });

        if(res.status === 403){
            throw new Error("Unauthorized ❌");
        }

        if(!res.ok){
            throw new Error("Error saving alumni");
        }

        alert("Alumni added successfully ✅");

        closeModal();
        clearForm();
        loadAlumni();

    }catch(err){
        alert(err.message);
    }
}


/* ================= LOAD ALUMNI ================= */
async function loadAlumni(){

    const token = localStorage.getItem("token");

    if(!token){
        window.location.href = "login.html";
        return;
    }

    try{
        const res = await fetch(BASE_URL + "/alumni", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if(res.status === 403){
            throw new Error("Access denied ❌");
        }

        const data = await res.json();

        const role = localStorage.getItem("role");

        let html = "";

        data.forEach(a => {

            let deleteBtn = "";

            // ✅ ONLY ADMIN CAN DELETE
            if(role === "ROLE_ADMIN"){
                deleteBtn = `<span onclick="deleteAlumni(${a.id})">🗑️</span>`;
            }

            html += `
            <div class="card">
                
                <div class="top">
                    <div class="avatar">${a.name ? a.name.charAt(0) : "A"}</div>

                    <div>
                        <h3>${a.name}</h3>
                        <p>${a.jobRole || ""} at ${a.company || ""}</p>
                    </div>

                    <div class="icons">
                        ${deleteBtn}
                    </div>
                </div>

                <div class="middle">
                    <span>🎓 ${a.course}</span>
                    <span>📅 Class of ${a.passoutYear}</span>
                </div>

                <div class="bottom">
                    <p>✉ ${a.email}</p>
                    <p>📞 ${a.phone}</p>
                </div>

            </div>
            `;
        });

        document.getElementById("list").innerHTML = html;

    }catch(err){
        alert("Failed to load alumni");
    }
}


/* ================= DELETE ================= */
async function deleteAlumni(id){

    const token = localStorage.getItem("token");

    if(!confirm("Delete this alumni?")) return;

    try{
        const res = await fetch(BASE_URL + "/alumni/" + id, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if(!res.ok){
            throw new Error("Delete failed");
        }

        alert("Deleted successfully ✅");
        loadAlumni();

    }catch(err){
        alert(err.message);
    }
}


/* ================= MODAL ================= */
function openModal(){
    document.getElementById("modal").style.display = "flex";
}

function closeModal(){
    document.getElementById("modal").style.display = "none";
}


/* ================= CLEAR FORM ================= */
function clearForm(){
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("course").value = "";
    document.getElementById("passoutYear").value = "";
    document.getElementById("company").value = "";
    document.getElementById("jobRole").value = "";
}


/* ================= AUTO LOAD ================= */
window.onload = function(){

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if(!token){
        window.location.href = "login.html";
        return;
    }

    // ✅ hide add button for USER
    if(role === "ROLE_USER"){
        const btn = document.getElementById("addBtn");
        if(btn) btn.style.display = "none";
    }

    if(window.location.pathname.includes("alumni.html")){
        loadAlumni();
    }
}


/* ================= LOGOUT ================= */
function logout(){
    localStorage.clear();
    window.location.href = "login.html";
}