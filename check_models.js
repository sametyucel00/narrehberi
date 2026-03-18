const key = "AIzaSyAC-dYdfkhQnITm8E1Ejf9nj9vKL803_q0";
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
    .then(r => r.json())
    .then(d => {
        console.log(d.models.map(m => m.name).join("\n"));
    })
    .catch(console.error);
