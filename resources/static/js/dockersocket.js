$(document).ready(function(){
    //Container counter variable
    var serviceCounter = 0
    var eventCounter = 0
    var nodeCounter = 0

    var image_colors = {}
    var service_colors = {}
    var api_token = 'ubersecret'
    var nodeMap = {}
    var serviceMap = {}
    var version = ''

    function parseNodesJson(data) {
       nodeMap = data;
       updateNodeCounter(nodeMap.length);
       for (index=0; index<nodeMap.length; index++) {
           var thisNode = "#cluster div[id='"+nodeMap[index].ID+"']"
           if ($(thisNode).length==0) {
               $('#cluster').append(create_div("node", nodeMap[index].ID, "#ffcc00", nodeMap[index].Description.Hostname))
           }
       }
    }

    function parseServicesJson(data) {
       serviceMap = data;
       updateServiceCounter(serviceMap.length);
       $('#services').empty();
       for (index=0; index<serviceMap.length; index++) {
           if (!service_colors[serviceMap[index].ID]) {
               service_colors[serviceMap[index].ID] = random_color()
           }
           var thisService = "#services div[id='"+serviceMap[index].ID+"']"
           if ($(thisService).length==0) {
               $('#services').append(create_div("image", serviceMap[index].ID, service_colors[serviceMap[index].ID], serviceMap[index].Spec.Name))
           }
       }
       $('[data-toggle="tooltip"]').tooltip();
    }

    function updateNodes(){
        var rest_endpoint = $(location).attr('protocol')+"//"+$(location).attr('host')+"/docker/nodes";
        $.ajax({
            url: rest_endpoint,
            crossDomain: false,
            headers: { 'Authorization': api_token },
            contentType: "application/json; charset=utf-8",
            type: "GET",
                    success: function(data, textStatus, jqXHR){
                        //console.log("[GET] Received: "+ prettyJson(data));
                        parseNodesJson(data);
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        console.log("[GET] Error: "+ errorThrown + ", Status: " + textStatus);
                        //$('#response_json').html(prettyJson(errorThrown));
                    },
            dataType: 'json',
            encode: true,
            async: false
        });
    }

    function updateServices(){
        var rest_endpoint = $(location).attr('protocol')+"//"+$(location).attr('host')+"/docker/services";
        $.ajax({
            url: rest_endpoint,
            crossDomain: false,
            headers: { 'Authorization': api_token },
            contentType: "application/json; charset=utf-8",
            type: "GET",
                    success: function(data, textStatus, jqXHR){
                        //console.log("[GET] Received: "+ prettyJson(data));
                        parseServicesJson(data);
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        console.log("[GET] Error: "+ errorThrown + ", Status: " + textStatus);
                        //$('#response_json').html(prettyJson(errorThrown));
                    },
            dataType: 'json',
            encode: true,
            async: false
        });
    }

    async function updateServicesInBackground() {
        while (true) {
            updateServices();
            await sleep(2000);
        }
    }

    async function updateVersionInBackground() {
        while (true) {
            updateVersion(false);
            await sleep(2000);
        }
    }

    function parseVersion(firstUpdate,data) {
        if (firstUpdate) {
            version=data;
             $('#version').html(version);
        }
        else {
            if (data != version) {
                location.reload(true);
            }
        }
    }

    function updateVersion(firstUpdate){
             var rest_endpoint = $(location).attr('protocol')+"//"+$(location).attr('host')+"/version";
             $.ajax({
                 url: rest_endpoint,
                 crossDomain: false,
                 headers: { 'Authorization': api_token },
                 contentType: "application/json; charset=utf-8",
                 type: "GET",
                         success: function(data, textStatus, jqXHR){
                             //console.log("[GET] Received: "+ prettyJson(data));
                             parseVersion(firstUpdate,data);
                         },
                         error: function(jqXHR, textStatus, errorThrown){
                             console.log("[GET] Error: "+ errorThrown + ", Status: " + textStatus);
                             //$('#response_json').html(prettyJson(errorThrown));
                         },
                 dataType: 'html',
                 encode: true,
                 async: false
             });
         }

    function updateEnv(){
             var rest_endpoint = $(location).attr('protocol')+"//"+$(location).attr('host')+"/env";
             $.ajax({
                 url: rest_endpoint,
                 crossDomain: false,
                 headers: { 'Authorization': api_token },
                 contentType: "application/json; charset=utf-8",
                 type: "GET",
                         success: function(data, textStatus, jqXHR){
                             //console.log("[GET] Received: "+ prettyJson(data));
                             $('#env').html(data);
                         },
                         error: function(jqXHR, textStatus, errorThrown){
                             console.log("[GET] Error: "+ errorThrown + ", Status: " + textStatus);
                             //$('#response_json').html(prettyJson(errorThrown));
                         },
                 dataType: 'html',
                 encode: true,
                 async: false
             });
         }

     function prettyJson(inp){
        return '<pre>'+syntaxHighlight(JSON.stringify(inp, null, 2))+'</pre>'
    }

    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function updateEventCounter(){
        eventCounter++;
        //$('#serviceCounter').attr('aria-valuenow',serviceCounter);
        //$('#serviceCounter').css('width',serviceCounter+'%');
        $('#eventCounter').html(eventCounter);
    }

    function updateNodeCounter(number){
        $('#nodeCounter').html(number);
    }


    function updateServiceCounter(number){
        if ((number<0) && (serviceCounter>0)) { serviceCounter = number; }
        else if (number>0) { serviceCounter = number; }
        $('#serviceCounter').html(serviceCounter);
    }


    function create_div(classname, id, color, beforeText) {
        var before = ''
        if (typeof(beforeText) != "undefined") {
            before = '<span class="label" style="background-color: '+color+'; float: left; padding: 5px; margin-bottom: 5px; margin-right: 5px;"  data-toggle="tooltip" title="ID: '+id+'">'+beforeText+'</span>'
        }
        var returnHtml = '<div class="'+classname+'" id="'+id+'" style="background-color: '+color+'; ">'+before+'</div>'
        return returnHtml
    }

    function create_ct_div(id, name) {
        var returnHtml = '<div class="ct" id="'+id+'" data-toggle="tooltip" title="'+name+'"></div>'
        return returnHtml
    }

    function create_svc_div(id, name) {
        var returnHtml = '<div class="svc" id="'+id+'" data-toggle="tooltip" title="'+name+'"></div>'
        return returnHtml
    }

    function random_color() {
        return '#'+Math.floor(Math.random()*16777215).toString(16);
    }

    updateVersion(true);
    updateEnv();
    updateNodes();
    updateServices();


    namespace = '/docker'; // change to an empty string to use the global namespace
    // the socket.io documentation recommends sending an explicit package upon connection
    // this is specially important when using the global namespace
    var sio = io.connect('http://' + document.domain + ':' + location.port + namespace, { transports: ['websocket', 'xhr-polling']});

    sio.on('connect', function(msg) {
        sio.emit('my_event', {data: 'I\'m connected!'});
    })

    sio.on('dockerevent', function(msg){
        console.log(msg)
        json = $.parseJSON(msg)
        $('#request_json').html(prettyJson(json) + $('#request_json').html());
        updateEventCounter();

    });


    // Add clear button functionality
    $('#clear_events').click(function(){
        $('#request_json').empty();
        eventCounter=-1;
        updateEventCounter();
    });


   updateServicesInBackground()
   updateVersionInBackground()

});