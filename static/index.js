document.addEventListener('DOMContentLoaded', () => {
    
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    
    // When connected, configure buttons
    socket.on('connect', () => {

        if (localStorage.getItem('username') == null){
            alert("Welcome! You must enter a display name to continue!")
            document.querySelector('#username-button').onclick = () => {
                document.getElementById('chatroom').style.display="none";
                username = document.getElementById('username-form').value;
                localStorage.setItem('username',username);
                localStorage.setItem('channel',"general");
                socket.emit('new user', {'username': username})
            };
        }else{
            document.getElementById('hide').style.display = "none";
            socket.emit('saved');
        }              
    });

    socket.on('chatroom', data=> {
        username = localStorage.getItem('username');
        document.getElementById('hide').style.display = "none";
        document.querySelector('#welcome').innerHTML="Hello <h4>" + username+"</h4> !";
        let elem=document.querySelector("h4");
        elem.style.color="blue";
        elem.style.display="inline";
        elem.style.fontWeight="bold";
        elem.style.fontSize="30px";
        displayActiveChannel(localStorage.getItem('channel'));  //remembering the channel 

        socket.emit('show channels');
        socket.emit('show dms', {'user': localStorage.getItem('username')});


        document.getElementById('chatroom').style.display = "block";
        
        document.querySelector('#add-channel').onclick = () => {
            add();
        };

        //add DM button click
        document.querySelector('#add-dm').onclick = () => {
            socket.emit('dropdown');
        };

        document.querySelector('#msg-button').onclick = () => {
            let msg = document.getElementById('msg-form').value;

            //save msg in server dictionary
            var date = getdate();
            var time = timestamp();
            
            socket.emit('msg', {'msg': msg , 'date': date, 'time': time, 'channel': localStorage.getItem('channel') , 'user': localStorage.getItem('username')});
            
            //show latest msg
            //alert("before sending: " + localStorage.getItem('channel'));
            socket.emit('show latest msg', { 'channel': localStorage.getItem('channel') });
            document.getElementById('msg-form').value = "";
        };
    });

    socket.on("show msgs", data =>{
        //alert("in show msgs: "+ localStorage.getItem('channel'));
        if (localStorage.getItem('channel') == data.channel){
            //alert("live channel");
            if (document.querySelectorAll("#one-msg").length == 1001){
                var list = document.getElementById("msgs");
                list.removeChild(list.firstChild);
            }
            const li = document.createElement('li');
            li.setAttribute("id","one-msg");
            li.innerHTML = "<b>"+ data.user +"</b>" + "<p> on "+ data.date + " at " + data.time + "</p> " + data.msg;
            if (data.user == localStorage.getItem('username')){
                li.style.textAlign="right";
                li.style.backgroundColor="gainsboro";
            }
            else{
                li.style.textAlign="left";
                li.style.backgroundColor="lightblue";
            }
            document.querySelector('#msgs').append(li);
        }
    });

    socket.on("display channels", data =>{
        const li = document.createElement('li');
        li.innerHTML = "#"+data.channel;
        li.onclick = () => {
            localStorage.setItem("channel", data.channel);
            displayActiveChannel(data.channel);
        }
        document.querySelector('#channel-list').append(li);
    });

    socket.on("display dms", data =>{
        const li = document.createElement('li');
        li.innerHTML = data.name;
        //alert("data.orginal: "+data.original);
        li.onclick = () => {
            localStorage.setItem("channel", data.original);
            displayActiveChannel(data.name);
        }
        document.querySelector('#dm-list').append(li);
    });

    socket.on('try again', () => {
        alert("That channel already exists! Please enter another one")
        document.getElementById('newCform').value="";
        check();
    });

    socket.on('create channel', data => {
        const li = document.createElement('li');
        li.innerHTML = data.channel;
        li.onclick = () => {
            localStorage.setItem("channel", data.channel);
            displayActiveChannel(data.channel);
        }    
        document.querySelector('#channel-list').append(li);        
        if (document.getElementById('newCform').value == data.channel){
            localStorage.setItem("channel", data.channel);
            displayActiveChannel(data.channel);
        }
        var temp = document.getElementById('newCform').remove();
        temp = document.getElementById('newCbutton').remove();
    });

    socket.on('dropdown' , data =>{
        var p = document.createElement('p');
        p.setAttribute("id","dm-item")
        p.innerHTML = data.user;
        document.querySelector('#dm-menu').append(p);
        p.onclick = () =>{
            localStorage.setItem("channel", data.user);
            displayActiveChannel(data.user);
            var list = document.getElementById("dm-menu");
            while (list.hasChildNodes()){
                list.removeChild(list.firstChild);
            }
            document.querySelector('#dm-list').append(p); //put rcvr name in msg bar
            socket.emit('new dm',{'channel': localStorage.getItem('username')+"-"+data.user});
            
        }
    });

    function timestamp(){
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes();
        return time;
    }
    function getdate(){
        var today = new Date();
        var date = (today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getFullYear();
        return date;
    }

    function displayActiveChannel(channelName){
        var list = document.getElementById("msgs");
        while (list.hasChildNodes()){
            list.removeChild(list.firstChild);
        }
        socket.emit('show msgs', { 'channel': localStorage.getItem("channel") });
        let heading = document.querySelector('#active-channel');
        heading.innerHTML = channelName;
    }

    function add(){
        var newCform = document.createElement('input');
        newCform.setAttribute("id","newCform");
        newCform.setAttribute("type","text");
        newCform.setAttribute("placeholder","Channel Name");
        document.getElementById('channel-list').appendChild(newCform);
        var newCbutton = document.createElement('button');
        newCbutton.setAttribute("id","newCbutton");
        newCbutton.setAttribute("value","Add");
        newCbutton.setAttribute("class","btn btn-primary");
        document.getElementById('channel-list').appendChild(newCbutton);
        check();
    }

    function check(){
        document.querySelector('#newCbutton').onclick = () => {
            let name = document.getElementById('newCform').value;
            socket.emit('new channel', {'name': name});
        };
    }
    


});
