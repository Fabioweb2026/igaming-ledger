function adminLogin(){

    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;

    if(user === "admin" && pass === "123456"){

        localStorage.setItem("adminAuth","true");

        window.location.href = "admin-dashboard.html";

    }else{

        document.getElementById("msg").innerHTML =
        "Login inválido";
    }
}

function auditorLogin(){

    const user = document.getElementById("auditorUser").value;
    const pass = document.getElementById("auditorPass").value;

    if(user === "auditor" && pass === "123456"){

        localStorage.setItem("auditorAuth","true");

        window.location.href = "auditor-dashboard.html";

    }else{

        document.getElementById("msg").innerHTML =
        "Login inválido";
    }
}
