window.onload = init;

function init() {
    var button = document.getElementById("addButton");
    button.onclick = handleButtonClick;
    loadList();
}

function removeComment() {
	//var button = document.getElementById("deleteButton");
	//button.onclick =
	var elem = document.getElementById("test");
	elem.parentNode.removeChild(elem);
	alert("Good Job");
}


function handleButtonClick() {
    var textInput = document.getElementById("comment");
    var comment = textInput.value;
    if(document.getElementById("commentChoice").checked){
       var radioValue = document.getElementById("commentChoice");
    }
    else if(document.getElementById("commentChoice1").checked = true){
        var radioValue = document.getElementById("commentChoice1");
     }
    	if(radioValue.value == "traveler"){
    		var name = prompt("please enter your name", "Anonymous");
    		var li = document.createElement("li");
    		li.setAttribute("id","test");
            li.innerHTML = name + " - " + comment + " <input type='button' onclick='removeComment()' id='deleteButton' value='Delete'>";
            var ul = document.getElementById("commentlist");
            ul.appendChild(li);
            save(comment);
    	}
    	else{
    		var li = document.createElement("li");
            li.innerHTML = comment;
            var ul = document.getElementById("manager");
            ul.appendChild(li);
            save(comment);
    	}
    
    
}