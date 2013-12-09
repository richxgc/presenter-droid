/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // App vars
    img: null, imgData: null, canvas: null, socket: null,
    pad: null, x: null, y: null, xo: null, yo: null,
    ip: null, port: null, source: null,
    nav: '#table-files',
    // Application Constructor
    initialize: function() {
        app.pad = document.getElementById('pad');
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        app.pad.addEventListener('touchstart',this.touchstart,false);
        app.pad.addEventListener('touchmove',this.touchmove,false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.getFileSystem();
        app.canvas = document.createElement('canvas');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        console.log('Received Event: ' + id);
    },
    goHome: function(){
        app.navigation('#table-files','Inicio',function(){
           //app.refresh();
        });
    },
    // Pad / Pointer events
    showPad: function(){
        app.navigation('#pad','Conexión',function(){});
    },
    touchstart: function(event){
        for(i=0;i<event.changedTouches.length;i++){
            app.xo = event.changedTouches[i].pageX;
            app.yo = event.changedTouches[i].pageY;
            console.log("xo: "+app.xo+" yo: "+app.yo);
        }
    },
    touchmove: function(event){
        for(i=0;i<event.changedTouches.length;i++){
            app.x = event.changedTouches[i].pageX;
            app.y = event.changedTouches[i].pageY;
            console.log("xo: "+app.xo+" yo: "+app.yo);
            console.log("x: "+app.x+" y: "+app.y);
            console.log('c=x: '+(app.x-app.xo)+' y: '+(app.y-app.yo));
            app.socket.emit('pointer',{x:(app.x-app.xo),y:(app.y-app.yo)});
        }
    },
    //get the file system
    getFileSystem: function(){
        window.requestFileSystem(LocalFileSystem.PERSISTENT,10000,app.onSuccess, app.fail);
    },
    //on succes get file system
    onSuccess: function(fileSystem){
        var sdcard = fileSystem.root;
        sdcard.getDirectory('DCIM/.thumbnails',{create:false},function(directory){
            var directoryReader = directory.createReader();
            directoryReader.readEntries(function(entries){
                var i, html, type;
                for (i=0; i<entries.length; i++) {
                    type = entries[i].name.substr(-3);
                    if(type == 'jpg'){
                        html = '<tr class="file"><td>'+entries[i].name.substr(10)+'...</td><td><img src="'+entries[i].fullPath+'" class="image-file" /></td></tr>';
                        $('#table-files').append(html);
                    }
                }
            },function(error){
                console.log(error);
            });
        });
    },
    //on error get file system
    onFail: function(error){
        console.log(error);
    },
    //on refresh app
    refresh: function(){
        $('#table-files').empty();
        app.getFileSystem();
    },
    //sockets implementation
    showConnect: function(source){
        app.navigation('#connect','Conexión',function(){
            if(app.ip != null){
                $('#ip').val(app.ip);
            }
            if(app.port != null){
                $('#port').val(app.port);
            }
        });
    },
    connect: function(){
        app.ip = $('#ip').val();
        app.port = $('#port').val();
        if((app.ip==null||app.ip=='')||(app.port==null||app.port=='')){
            alert('No has especificado una ip o puerto');
            return;
        }
        app.source = 'http://'+app.ip+':'+app.port;
        app.socket = io.connect(app.source);
        app.socket.on('response',function(data){
            if(data.success == true){
                alert('La conexión se realizo con exito');
            }
        });
    },
    navigation: function(showid,title,callback){
        $('.navbar-toggle').trigger('click');
        $(app.nav).fadeOut('fast',function(){
            $(showid).fadeIn('fast');
            $('.navbar-brand').text(title);
            app.nav = showid;
            callback();
        });
    }
};

window.onerror = function(){
    alert('Ha ocurrido un error inesperado');
}

$(document).on('ready',eventsJQ);

function eventsJQ(){
    $(document).on('click','.image-file',function(event){
        app.img = event.target;
        $('#loading-view').modal('show');
        $('#loading-view').on('shown.bs.modal', function(event) {
            app.imgData = base64Img(app.img);
            console.log(app.imgData);
            app.socket.emit('sendImage',{source:app.imgData});
            $('#loading-view').modal('hide');
        });
    });
}

function base64Img(img){
    app.canvas.width = img.naturalWidth;
    app.canvas.height = img.naturalHeight;
    console.log(app.canvas.width);
    console.log(app.canvas.height);
    var context = app.canvas.getContext('2d');
    context.drawImage(img,0,0,app.canvas.width,app.canvas.height);
    var data = app.canvas.toDataURL();
    return data;
}