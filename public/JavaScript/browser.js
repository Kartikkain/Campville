const fileInput=document.querySelector('.browser-input');
const fileName=document.querySelector('.browser-text');

fileInput.addEventListener('change',()=>{
    if(fileInput.value){
        fileName.innerHTML=fileInput.value.match( /[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
        console.log(fileInput.value);
    }
    
    else{
        fileInput.innerHTML="Choose Images";
    }
})