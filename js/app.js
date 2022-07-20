"use strict";

let displayAllTasks = {};
// Create a new list item when clicking on the "Add" button
function newElement() {
    var div = document.createElement("div");
    var title = document.getElementById("title").value;

    var h3 = document.createElement("h3");
    const date_now = getCurrentTimestamp();
    var id = document.createTextNode('#'+date_now.getTime());
    div.id = date_now.getTime();
    console.log('time',getCurrentTimestamp(),date_now);

    // span.className = "close";
    h3.appendChild(id);
    div.appendChild(h3);

    div.classList.toggle('item');
    div.setAttribute('draggable', true);
    div.addEventListener('dragstart', dragStart);
    // div.setAttribute('dragstart',""+dragStart());
    // div.setAttribute('dragend',""+dragEnd());

    div.addEventListener('dragend', dragEnd);

    var desc = document.getElementById("desc").value;

    //////////////////////////
    var listItem=createNewTaskElement([title,desc],div);

    //Append listItem to actions

    bindTaskEvents(listItem,div);

    //////////////////////////

    if (title === '' || desc === '' ) {
        alert("You must write something!");
    } else {
        document.getElementById("allTasks").appendChild(div);
    }


    // clear data from inputs
    document.getElementById("title").value = "";
    document.getElementById("desc").value = "";

    var p = document.createElement("P");
    var time_now = displayTime();
    var create_at = document.createTextNode('create_at : '+ time_now);

    p.appendChild(create_at);
    div.appendChild(p);

    var p_updated = document.createElement("P");
    p_updated.id = 'updated'+div.id;
    var updated_at = document.createTextNode('updated_at : '+ time_now);

    p_updated.appendChild(updated_at);
    div.appendChild(p_updated);

    emitChangeAction(getAllTasks());
}



//New task list item
var createNewTaskElement=function(taskString,listItem){

    //label
    var label=document.createElement("label");//label
    //input (text)
    var editInput=document.createElement("input");//text
    //desc
    var desc=document.createElement("label");//desc
    //textarea
    var editDesc=document.createElement("textarea");//textarea
    //button.edit
    var editButton=document.createElement("button");//edit button

    //button.delete
    var deleteButton=document.createElement("button");//delete button

    label.innerText=taskString[0];
    desc.innerText=taskString[1];
    desc.className = 'p-2';
    desc.className = 'desc';

    //Each elements, needs appending
    // checkBox.type="checkbox";
    editInput.type="text";

    editButton.innerText="Edit";//innerText encodes special characters, HTML does not.
    editButton.className="edit";
    deleteButton.innerText="Delete";
    deleteButton.className="delete";
    // deleteButton.onclick = newDeleteTask(listItem.id);
    // deleteButton.innerHTML="<p onclick='newDeleteTask("+ listItem.id+")'></p>";


    // status
    var select = document.createElement("label");//status

    select.className = 'p-2';
    select.className = 'status';
    select.innerText = 'allTasks';

    // select status
    var editSelect = document.createElement("select");
    editSelect.className = 'p-2';
    editSelect.className = 'form-control';
    // editSelect.className = 'hide';
    editSelect.style.display = 'none';

    editSelect.id = "select"+listItem.id;

    // editSelect.setAttribute('onchange',"changeStatus(select"+listItem.id+")");

    var options = ['allTasks','inProgress','hold','completed','cancelled'];
    options.forEach(item => {
        var option = document.createElement("option");
        option.text = item;
        option.value = item;
        if (item === 'allTasks'){
            option.selected = "true";
        }
        editSelect.add(option);
    });



    //and appending.
    listItem.appendChild(label);
    listItem.appendChild(editInput);
    listItem.appendChild(document.createElement("br"));
    listItem.appendChild(desc);
    listItem.appendChild(editDesc);
    listItem.appendChild(document.createElement("br"));
    var p = document.createElement("p");
    p.innerHTML ='status :';
    listItem.appendChild(p);
    listItem.appendChild(select);
    listItem.appendChild(editSelect);
    listItem.appendChild(document.createElement("br"));
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    return listItem;
};

var bindTaskEvents=function(taskListItem,item){

    var editButton=taskListItem.querySelector("button.edit");
    var deleteButton=taskListItem.querySelector("button.delete");


    //Bind editTask to edit button.
    editButton.setAttribute('onclick',"newEditTask("+item.id+")");

    //Bind deleteTask to delete button.
    deleteButton.setAttribute('onclick',"newDeleteTask("+item.id+")");

};

//Edit an existing task.

function getCurrentTimestamp () {
    return new Date()
}

function displayTime() {
    var str = "";

    var currentTime = getCurrentTimestamp ();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();

    if (minutes < 10) {
        minutes = "0" + minutes
    }
    if (seconds < 10) {
        seconds = "0" + seconds
    }
    str += hours + ":" + minutes + ":" + seconds + " ";
    if(hours > 11){
        str += "PM"
    } else {
        str += "AM"
    }
    return currentTime.toLocaleDateString() + ' ' +str;
}

function emitChangeAction(displayAllTasks){
    socket.emit("send", displayAllTasks);
}

addEventListenerColumnsAndItems();

let dragItem = null;

function dragStart() {
    console.log('drag started',this);
    dragItem = this;
    console.log('dragItem', dragItem);
    setTimeout(() => this.className = 'invisible', 0)

}

function dragEnd() {
    console.log('drag ended',this);
    this.className = 'item';
    dragItem = null;
    // emit change
    emitChangeAction(getAllTasks());
}

function dragDrop() {
    console.log('drag dropped',this,dragItem);
    this.append(dragItem);

}

function dragOver(e) {
    e.preventDefault()
}

function getAllTasks(){

    let getAllTasks    = document.getElementById("getAllTasks").innerHTML;

    addEventListenerColumnsAndItems();
    return {
        'getAllTasks'      : getAllTasks,
    };
}

function addEventListenerColumnsAndItems()
{
    var items = document.querySelectorAll('.item');
    var columns = document.querySelectorAll('.column');

    console.log('items',items,columns);

    items.forEach(item => {
        item.addEventListener('dragstart', dragStart);
        // item.setAttribute('dragstart',""+dragStart());
        // item.setAttribute('dragend',""+dragEnd());

        item.addEventListener('dragend', dragEnd);
    });
    console.log(items);
    columns.forEach(column => {

        column.addEventListener('dragover', dragOver);
        // column.setAttribute('dragover',""+dragOver);

        // column.addEventListener('dragenter', dragEnter);
        // column.addEventListener('dragleave', dragLeave);

        // column.setAttribute('drop',""+dragDrop());

        column.addEventListener('drop', dragDrop);
    });
}

function newDeleteTask(id){

    var item = document.getElementById(id.toString());

    //Remove the parent list item from the ul.
    item.remove();

    // emit change
    emitChangeAction(getAllTasks());

}

function newEditTask(id){
    console.log("Edit Task...");
    console.log("Change 'edit' to 'save'");

    var listItem = document.getElementById(id.toString());
    // var listItem=this.parentNode;

    var editInput=listItem.querySelector('input[type=text]');
    var label=listItem.querySelector("label");
    var containsClass=listItem.classList.contains("editMode");

    var editDesc=listItem.querySelector('textarea');
    var textarea = listItem.querySelector(".desc");

    var editSelect=listItem.querySelector('select');
    var select = listItem.querySelector(".status");
    // var containsTextareaClass= listItem.classList.contains("editMode");
    //If class of the parent is .editmode
    if(containsClass){
        editSelect.style.display = 'none';

        // editSelect.className = 'show';
        console.log('display  ',editSelect.style.display);
        // var element = document.getElementsByClassName("hide");
        //
        // console.log('element', element);
        // element.classList.remove("hide");
        //switch to .editmode
        //label becomes the inputs value.
        label.innerText=editInput.value;
        textarea.innerText=editDesc.value;
        select.innerText=editSelect.value;
        var update_p = document.getElementById('updated'+id.toString());
        update_p.innerText = 'updated_at : ' + displayTime();
    }else{
        // editInput.value=label.innerText;
        editInput.setAttribute('value',""+label.innerText);
        editSelect.setAttribute('value',""+select.innerText);
        // console.log('editSelect.children', editSelect,editSelect.children);
        Array.from(editSelect.options).forEach(item => {
            // console.log('select item',item,item.value,select.innerText);
            if (select.innerText === item.value) {

                item.setAttribute('selected', true);
            }
        });
        editDesc.innerText=textarea.innerText;
        // editSelect.className = 'hide';
        editSelect.style.display = 'block';

    }

    // console.log('finish edit', editInput,editDesc);
    //toggle .editmode on the parent.
    listItem.classList.toggle("editMode");
    // emit change
    emitChangeAction(getAllTasks());
}

function changeStatus(select){
    console.log(select.value);
    // emitChangeAction(getAllTasks());
}

