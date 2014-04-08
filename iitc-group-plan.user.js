// ==UserScript==
// @id             iitc-plugin-group-plan
// @name           IITC plugin: Group Plan
// @category       Layer
// @version        0.0.1
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      
// @downloadURL    
// @description    Shows plans with team members
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
    if(typeof window.plugin !== 'function') window.plugin = function() {};
    
    window.plugin.groupPlan = function() {};
    
    
    window.plugin.groupPlan.settings = function() {
         dialog({
      html: "<b>Server URL :</b><input type=\"text\" name=\"ServerURL\" value=\""+window.plugin.groupPlan.url+"\"onchange=\"window.plugin.groupPlan.url=this.value\"></br><b>Server Username :</b><input type=\"text\" name=\"ServerUsername\" ></br><b>Server Password :</b><input type=\"text\" name=\"Password\"></br>",
      title: 'Settings'
    });

    }




    window.plugin.groupPlan.updateHidden = function(playername, status){
console.log(status)
    if (status == true){
        window.plugin.groupPlan.useruuidmapping[playername] = ""
if (window.plugin.groupPlan.hidden.indexOf(playername) > -1) {

    window.plugin.groupPlan.hidden.splice(window.plugin.groupPlan.hidden.indexOf(playername), 1);
}
} else {
    if (window.plugin.groupPlan.hidden.indexOf(playername) == -1) {

window.plugin.groupPlan.hidden.push(playername)

                for (var key in window.plugin.groupPlan.datalayer[playername]) {
                    var item = window.plugin.groupPlan.datalayer[playername][key]
                    window.plugin.groupPlan.layer.removeLayer(item)
                    
                    
                }


}

}

}

    window.plugin.groupPlan.selectors = function(){
        html = ""
        for (var player in window.plugin.groupPlan.useruuidmapping) {
            if (window.plugin.groupPlan.hidden.indexOf(player)){
                checked = "checked"
            } else {
                checked = ""
            }
        html = html + "<input onchange=\"window.plugin.groupPlan.updateHidden(this.value, this.checked)\" type=\"checkbox\" name=\"selected\" value=\""+player+"\" "+checked+">"+player+"<br>"
}
         dialog({
      html: html,
      title: 'Group Plan Layers'
    });
    }

    window.plugin.groupPlan.setup = function() {
        window.plugin.groupPlan.context = PLAYER.nickname;
        window.plugin.groupPlan.url = "http://119.9.15.56:6529/";
        window.plugin.groupPlan.layer = L.layerGroup([]);
        
        window.addLayerGroup('Group Plan', window.plugin.groupPlan.layer, true);
        $('#toolbox').append('<a onclick="window.plugin.groupPlan.settings();return false;">Group Plan Opts</a>');
        $('#toolbox').append('<a onclick="window.plugin.groupPlan.selectors();return false;">Group Plan Layers</a>');
    }
    
    setup = window.plugin.groupPlan.setup;
    
    window.plugin.groupPlan.hidden = []
    window.plugin.groupPlan.useruuidmapping = {}
    
    window.plugin.groupPlan.syncPlan = function(data){
        console.log(data)
        for (var player in data['users']) {
            var uuid = data['users'][player];
            if (window.plugin.groupPlan.useruuidmapping[player] != uuid) {
                console.log("update detected for " + player)
               
                window.plugin.groupPlan.useruuidmapping[player] = uuid
                if(typeof window.plugin.groupPlan.datalayer[player] === 'undefined'){
                    window.plugin.groupPlan.datalayer[player]=[]
                }
                for (var key in window.plugin.groupPlan.datalayer[player]) {
                    var item = window.plugin.groupPlan.datalayer[player][key]
                    window.plugin.groupPlan.layer.removeLayer(item)
                    
                    
                }
                window.plugin.groupPlan.datalayer[player]=[]
                 if (player != PLAYER.nickname && player != window.plugin.groupPlan.context && window.plugin.groupPlan.hidden.indexOf(player) == -1){
                    window.plugin.groupPlan.importdraw(player, data['draws'][player]);
                    
                }
            }
        }
        
        
        
    }
    
    
    
    
    window.plugin.groupPlan.stringToColour = function(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }
    
    window.plugin.groupPlan.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
    
    
    
    window.plugin.groupPlan.datalayer = {}
    
    window.plugin.groupPlan.importdraw = function(player, data) {
        
        $.each(data, function(index,item) {
            
            var layer = null;
            var extraOpt = {};
            item.color = window.plugin.groupPlan.stringToColour(player);
            extraOpt.color = window.plugin.groupPlan.stringToColour(player);
            
            switch(item.type) {
                case 'polyline':
                    layer = L.geodesicPolyline(item.latLngs, L.extend({},window.plugin.drawTools.lineOptions,extraOpt));
                    break;
                case 'polygon':
                    layer = L.geodesicPolygon(item.latLngs, L.extend({},window.plugin.drawTools.polygonOptions,extraOpt));
                    break;
                case 'circle':
                    layer = L.geodesicCircle(item.latLng, item.radius, L.extend({},window.plugin.drawTools.polygonOptions,extraOpt));
                    break;
                case 'marker':
                    var extraMarkerOpt = {};
                    if (item.color) extraMarkerOpt.icon = window.plugin.drawTools.getMarkerIcon(item.color);
                    layer = L.marker(item.latLng, L.extend({},window.plugin.drawTools.markerOptions,extraMarkerOpt));
                    break;
                default:
                    console.warn('unknown layer type "'+item.type+'" when loading draw tools layer');
                    break;
            }
            if (layer) {
                window.plugin.groupPlan.datalayer[player].push(layer);
                window.plugin.groupPlan.layer.addLayer(layer)
                
            }
        });
        
        
    }
    
    window.plugin.groupPlan.updatereq = function (){
        $.ajax({
            url: window.plugin.groupPlan.url,
            
            jsonp: "callback",
            
            dataType: "jsonp",
            
            data: 
            {o: localStorage['plugin-draw-tools-layer'],
             y: window.plugin.groupPlan.guid(),
             agentname: window.plugin.groupPlan.context},
            
            // work with the response
            success: function( response ) {
                console.log( response ); // server response
            }
        });
    }
    
    window.setInterval(window.plugin.groupPlan.updatereq,2000);
    
    
    setup.info = plugin_info; //add the script info data to the function as a property
    if(!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
