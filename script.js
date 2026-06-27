/* ===========================================
   SITE FINDER PRO
   script.js
   PART 1
=========================================== */

let database = [];
let filteredData = [];
let favorites = [];
let histories = [];

const mapping = {

    oldSite:2,
    idSite:4,
    nameSite:5,
    address:8,
    mc:11,
    coordinate:14,
    tlp:15,
    idTlp:16,
    idPln:17,
    cluster:23,
    hostname:41,
    rts:46,
    te:49,
    cme:53,
    access:59

};

const searchInput=document.getElementById("searchInput");
const resultList=document.getElementById("resultList");
const detailPanel=document.getElementById("detailPanel");
const loader=document.getElementById("loader");

/* ===========================
LOAD
=========================== */

window.onload=function(){

    loadTheme();

    loadDatabase();

    loadFavorite();

    loadHistory();

};

/* ===========================
DATABASE
=========================== */

function loadDatabase(){

    const saved=localStorage.getItem("SITE_DB");

    if(saved){

        database=JSON.parse(saved);

        updateDashboard();

        document.getElementById("dbStatus").innerHTML="Loaded";

        document.getElementById("status").innerHTML="Database Ready";

    }

}

function saveDatabase(){

    localStorage.setItem(

        "SITE_DB",

        JSON.stringify(database)

    );

}

function updateDashboard(){

    document.getElementById("totalSite").innerHTML=

    Math.max(database.length-1,0).toLocaleString();

}

/* ===========================
UPLOAD
=========================== */

document
.getElementById("excelFile")
.addEventListener("change",uploadExcel);

function uploadExcel(e){

    const file=e.target.files[0];

    if(!file) return;

    loader.style.display="flex";

    const reader=new FileReader();

    reader.onload=function(evt){

        const workbook=XLSX.read(

            new Uint8Array(evt.target.result),

            {

                type:"array"

            }

        );

        let sheet=null;

        if(workbook.Sheets["DB Master"])

            sheet=workbook.Sheets["DB Master"];

        else

            sheet=workbook.Sheets[workbook.SheetNames[0]];

        database=XLSX.utils.sheet_to_json(

            sheet,

            {

                header:1

            }

        );

        saveDatabase();

        updateDashboard();

        loader.style.display="none";

        document.getElementById("status").innerHTML=

        "Database Loaded";

        document.getElementById("dbStatus").innerHTML=

        "Loaded";

    }

    reader.readAsArrayBuffer(file);

}

/* ===========================
CLEAR DATABASE
=========================== */

document
.getElementById("clearDB")
.onclick=function(){

    if(!confirm("Hapus database?"))

        return;

    localStorage.removeItem("SITE_DB");

    database=[];

    updateDashboard();

    resultList.innerHTML="";

    detailPanel.innerHTML="";

    document.getElementById("status").innerHTML="Empty";

};

/* ===========================
DRAG DROP
=========================== */

const drop=document.getElementById("dropZone");

drop.addEventListener("dragover",function(e){

    e.preventDefault();

    drop.classList.add("drag");

});

drop.addEventListener("dragleave",function(){

    drop.classList.remove("drag");

});

drop.addEventListener("drop",function(e){

    e.preventDefault();

    drop.classList.remove("drag");

    const file=e.dataTransfer.files[0];

    if(!file) return;

    document.getElementById("excelFile").files=

    e.dataTransfer.files;

    uploadExcel({

        target:{

            files:e.dataTransfer.files

        }

    });

});

/* ===========================
SEARCH
=========================== */

document
.getElementById("searchBtn")
.onclick=searchSite;

searchInput.addEventListener("keyup",function(e){

    if(e.key==="Enter")

        searchSite();

});

searchInput.addEventListener("input",function(){

    if(this.value.trim().length<2){

        resultList.innerHTML="";

        return;

    }

    searchSite();

});

function searchSite(){

    if(database.length==0)

        return;

    const keyword=

    searchInput.value

    .trim()

    .toUpperCase();

    if(keyword==="")

        return;

    filteredData=

    database.filter(function(row,index){

        if(index===0)

            return false;

        return Object.values(mapping).some(function(col){

            return String(

                row[col]||""

            )

            .toUpperCase()

            .includes(keyword);

        });

    });

    renderResult();

}


/* ===========================================
   SITE FINDER PRO
   script.js
   PART 2
=========================================== */

/* ===========================
RENDER RESULT
=========================== */

function renderResult(){

    resultList.innerHTML="";

    if(filteredData.length===0){

        resultList.innerHTML=`

        <div class="welcome">

            <h3>

                Data tidak ditemukan

            </h3>

        </div>

        `;

        return;

    }

    filteredData.forEach(function(row,index){

        const item=document.createElement("div");

        item.className="site-item";

        item.innerHTML=`

            <h3>

                ${row[mapping.idSite]||"-"}

            </h3>

            <span>

                ${row[mapping.nameSite]||"-"}

            </span>

            <span>

                ${row[mapping.cluster]||"-"}

            </span>

        `;

        item.onclick=function(){

            showDetail(row);

            saveHistory(

                row[mapping.idSite]

            );

        };

        resultList.appendChild(item);

    });

}

/* ===========================
DETAIL
=========================== */

function showDetail(row){

    detailPanel.innerHTML=`

    <div class="detail-grid">

        ${card("Old Site",row[mapping.oldSite])}

        ${card("ID Site",row[mapping.idSite])}

        ${card("Site Name",row[mapping.nameSite])}

        ${card("Hostname",row[mapping.hostname])}

        ${card("Cluster",row[mapping.cluster])}

        ${card("MC",row[mapping.mc])}

        ${card("Address",row[mapping.address])}

        ${card("Coordinate",row[mapping.coordinate])}

        ${card("TLP",row[mapping.tlp])}

        ${card("ID TLP",row[mapping.idTlp])}

        ${card("ID PLN",row[mapping.idPln])}

        ${card("RTS",row[mapping.rts])}

        ${card("TE",row[mapping.te])}

        ${card("CME",row[mapping.cme])}

        ${card("Access",row[mapping.access])}

    </div>

    <div class="action">

        <button

            class="copy"

            onclick="copySite('${row[mapping.idSite]}')">

            📋 Copy Site

        </button>

        <button

            class="maps"

            onclick="openMaps('${row[mapping.coordinate]}')">

            📍 Maps

        </button>

        <button

            class="favorite"

            onclick="addFavorite('${row[mapping.idSite]}')">

            ⭐ Favorite

        </button>

    </div>

    `;

}

function card(title,value){

    return`

    <div class="info">

        <label>

            ${title}

        </label>

        <strong>

            ${value||"-"}

        </strong>

    </div>

    `;

}

/* ===========================
COPY
=========================== */

function copySite(site){

    navigator.clipboard.writeText(site);

}

/* ===========================
GOOGLE MAPS
=========================== */

function openMaps(coord){

    if(!coord){

        showToast("Coordinate kosong.");
        return;

    }

    coord = coord.toString().trim();

    // Hilangkan spasi
    coord = coord.replace(/\s+/g,"");

    // Pecah berdasarkan koma
    let arr = coord.split(",");

    if(arr.length===4){

        // contoh:
        // -8,51234,116,12345

        coord = arr[0]+"."+arr[1]+","+arr[2]+"."+arr[3];

    }

    else if(arr.length>2){

        const tengah=Math.floor(arr.length/2);

        const lat=arr.slice(0,tengah).join(".");
        const lng=arr.slice(tengah).join(".");

        coord=lat+","+lng;

    }

    window.open(

        "https://www.google.com/maps?q="+encodeURIComponent(coord),

        "_blank"

    );

}

/* ===========================
FAVORITE
=========================== */

function loadFavorite(){

    favorites=

    JSON.parse(

        localStorage.getItem("SITE_FAVORITE")

        ||"[]"

    );

    document.getElementById(

        "favoriteTotal"

    ).innerHTML=favorites.length;

}

function addFavorite(site){

    if(

        favorites.includes(site)

    )

        return;

    favorites.push(site);

    localStorage.setItem(

        "SITE_FAVORITE",

        JSON.stringify(favorites)

    );

    document.getElementById(

        "favoriteTotal"

    ).innerHTML=favorites.length;

}

/* ===========================
HISTORY
=========================== */

function loadHistory(){

    histories=

    JSON.parse(

        localStorage.getItem("SITE_HISTORY")

        ||"[]"

    );

    document.getElementById(

        "historyTotal"

    ).innerHTML=

    histories.length;

}

function saveHistory(site){

    histories=

    histories.filter(function(x){

        return x!==site;

    });

    histories.unshift(site);

    if(histories.length>20)

        histories.pop();

    localStorage.setItem(

        "SITE_HISTORY",

        JSON.stringify(histories)

    );

    document.getElementById(

        "historyTotal"

    ).innerHTML=

    histories.length;

}


/* ===========================================
   SITE FINDER PRO
   script.js
   PART 3 (FINAL)
=========================================== */

/* ===========================
THEME
=========================== */

function loadTheme(){

    const theme=localStorage.getItem("SITE_THEME");

    if(theme==="light"){

        document.body.classList.add("light");

    }

}

document
.getElementById("themeBtn")
.addEventListener("click",toggleTheme);

function toggleTheme(){

    document.body.classList.toggle("light");

    const theme=

        document.body.classList.contains("light")

        ? "light"

        : "dark";

    localStorage.setItem(

        "SITE_THEME",

        theme

    );

}

/* ===========================
RELOAD DATABASE
=========================== */

document
.getElementById("reloadDB")
.addEventListener("click",function(){

    loadDatabase();

    showToast(

        "Database berhasil dimuat ulang."

    );

});

/* ===========================
AUTO SELECT FIRST RESULT
=========================== */

const _renderResult=renderResult;

renderResult=function(){

    _renderResult();

    if(filteredData.length>0){

        showDetail(

            filteredData[0]

        );

    }

}

/* ===========================
KEYBOARD SHORTCUT
=========================== */

document.addEventListener(

    "keydown",

    function(e){

        if(

            e.ctrlKey &&

            e.key.toLowerCase()==="f"

        ){

            e.preventDefault();

            searchInput.focus();

        }

        if(

            e.ctrlKey &&

            e.key.toLowerCase()==="d"

        ){

            e.preventDefault();

            toggleTheme();

        }

        if(

            e.key==="Escape"

        ){

            searchInput.value="";

            resultList.innerHTML="";

            detailPanel.innerHTML=`

            <div class="welcome">

                <h2>

                    Welcome

                </h2>

                <p>

                    Search Site...

                </p>

            </div>

            `;

        }

    }

);

/* ===========================
SEARCH OPTIMIZATION
=========================== */

function normalize(str){

    return String(str||"")

    .trim()

    .toUpperCase();

}

function containsKeyword(row,keyword){

    for(const col of Object.values(mapping)){

        if(

            normalize(row[col])

            .includes(keyword)

        ){

            return true;

        }

    }

    return false;

}

/* Override Search */

searchSite=function(){

    if(database.length===0){

        showToast(

            "Database belum dimuat."

        );

        return;

    }

    const keyword=

    normalize(

        searchInput.value

    );

    if(keyword===""){

        resultList.innerHTML="";

        detailPanel.innerHTML="";

        return;

    }

    filteredData=[];

    for(let i=1;i<database.length;i++){

        const row=database[i];

        if(

            containsKeyword(

                row,

                keyword

            )

        ){

            filteredData.push(row);

        }

    }

    renderResult();

}

/* ===========================
TOAST
=========================== */

function showToast(text){

    let toast=document.createElement(

        "div"

    );

    toast.className="toast";

    toast.innerHTML=text;

    document.body.appendChild(

        toast

    );

    setTimeout(function(){

        toast.classList.add(

            "show"

        );

    },50);

    setTimeout(function(){

        toast.classList.remove(

            "show"

        );

        setTimeout(function(){

            toast.remove();

        },300);

    },2500);

}

/* ===========================
COPY
=========================== */

const _copySite=copySite;

copySite=function(site){

    _copySite(site);

    showToast(

        "Site ID berhasil disalin."

    );

}

/* ===========================
MAPS
=========================== */

const _openMaps=openMaps;

openMaps=function(coord){

    if(!coord){

        showToast(

            "Coordinate kosong."

        );

        return;

    }

    _openMaps(coord);

}

/* ===========================
FAVORITE
=========================== */

const _addFavorite=addFavorite;

addFavorite=function(site){

    _addFavorite(site);

    showToast(

        site+

        " ditambahkan ke Favorite."

    );

}

/* ===========================
EXPORT FAVORITE
=========================== */

function exportFavorite(){

    const blob=new Blob(

        [

            JSON.stringify(

                favorites,

                null,

                2

            )

        ],

        {

            type:"application/json"

        }

    );

    const a=document.createElement(

        "a"

    );

    a.href=URL.createObjectURL(blob);

    a.download="favorite.json";

    a.click();

}

/* ===========================
AUTO SAVE HISTORY
=========================== */

window.addEventListener(

    "beforeunload",

    function(){

        localStorage.setItem(

            "SITE_HISTORY",

            JSON.stringify(

                histories

            )

        );

    }

);

/* ===========================
READY
=========================== */

showToast(

    "SITE FINDER PRO READY"

);